import * as Tfm from "./tfm";
import fontdata from "./fonts.json";
import { Buffer } from 'buffer';
const NO_TAG = 0;
const LIG_TAG = 1;
const LIST_TAG = 2;
const EXT_TAG = 3;
const KERN_OPCODE = 128;
const tables = { header: 0,
    character_info: 1,
    width: 2,
    height: 3,
    depth: 4,
    italic_correction: 5,
    lig_kern: 6,
    kern: 7,
    extensible_character: 8,
    font_parameter: 9
};
function word_ptr(base, index) {
    return base + 4 * index;
}
class TFMParser {
    constructor(stream) {
        this.stream = stream;
        this.position = 0;
        this.length = 0;
        this.table_lengths = [];
        this.table_pointers = [];
        this.entire_file_length = 0;
        this.smallest_character_code = 0;
        this.largest_character_code = 0;
        this.number_of_chars = 0;
        this.read_lengths();
        this.read_header();
        this.read_font_parameters();
        this.read_lig_kern_programs();
        this.read_characters();
    }
    seek(position) {
        this.position = position;
    }
    read_unsigned_byte1(p) {
        if (p)
            this.position = p;
        var result = this.stream.readUInt8(this.position);
        this.position = this.position + 1;
        return result;
    }
    read_unsigned_byte2(p) {
        if (p)
            this.position = p;
        var result = this.stream.readUInt16BE(this.position);
        this.position = this.position + 2;
        return result;
    }
    read_unsigned_byte4(p) {
        if (p)
            this.position = p;
        var result = this.stream.readUInt32BE(this.position);
        this.position = this.position + 4;
        return result;
    }
    read_four_byte_numbers_in_table(table, index) {
        this.seek(this.position_in_table(table, index));
        return [this.read_unsigned_byte1(),
            this.read_unsigned_byte1(),
            this.read_unsigned_byte1(),
            this.read_unsigned_byte1()];
    }
    read_extensible_recipe(index) {
        return this.read_four_byte_numbers_in_table(tables.extensible_character, index);
    }
    read_fix_word(p) {
        if (p)
            this.position = p;
        var result = this.stream.readUInt32BE(this.position);
        this.position = this.position + 4;
        return result;
    }
    read_fix_word_in_table(table, position) {
        return this.read_fix_word(this.position_in_table(table, position));
    }
    read_bcpl(position) {
        if (position)
            this.position = position;
        var length = this.read_unsigned_byte1();
        var result = this.stream.slice(this.position, this.position + length).toString('ascii');
        this.position += length;
        return result;
    }
    seek_to_table(table, position) {
        if (position)
            this.seek(this.position_in_table(table, position));
        else
            this.seek(this.table_pointers[table]);
    }
    position_in_table(table, index) {
        return word_ptr(this.table_pointers[table], index);
    }
    read_lengths() {
        this.table_lengths = [];
        this.seek(0);
        this.entire_file_length = this.read_unsigned_byte2();
        var header_length = this.read_unsigned_byte2();
        this.smallest_character_code = this.read_unsigned_byte2();
        this.largest_character_code = this.read_unsigned_byte2();
        var header_data_length_min = 18;
        this.table_lengths[tables.header] = Math.max(header_data_length_min, header_length);
        this.number_of_chars = this.largest_character_code - this.smallest_character_code + 1;
        this.table_lengths[tables.character_info] = this.number_of_chars;
        for (var i = tables.width; i <= tables.font_parameter; i++) {
            this.table_lengths[i] = this.read_unsigned_byte2();
        }
        this.table_pointers = [];
        this.table_pointers[tables.header] = 24;
        for (var table = tables.header; table < tables.font_parameter; table++) {
            this.table_pointers[table + 1] = this.position_in_table(table, this.table_lengths[table]);
        }
        var length = this.position_in_table(tables.font_parameter, this.table_lengths[tables.font_parameter]);
        if (length != word_ptr(0, this.entire_file_length)) {
            throw Error('Bad TFM file');
        }
        return;
    }
    read_header() {
        this.seek_to_table(tables.header);
        var checksum = this.read_unsigned_byte4();
        var designSize = this.read_fix_word();
        var character_info_table_position = this.table_pointers[tables.character_info];
        var position = this.position;
        var character_coding_scheme;
        if (position < character_info_table_position)
            character_coding_scheme = this.read_bcpl();
        var character_coding_scheme_length = 40;
        position += character_coding_scheme_length;
        var family;
        if (position < character_info_table_position)
            family = this.read_bcpl(position);
        var family_length = 20;
        position += family_length;
        if (position < character_info_table_position) {
            var seven_bit_safe_flag = this.read_unsigned_byte1(position);
            this.read_unsigned_byte2();
            var face = this.read_unsigned_byte1();
        }
        this.tfm = new Tfm.Tfm(this.smallest_character_code, this.largest_character_code, checksum, designSize, character_coding_scheme, family);
    }
    read_font_parameters() {
        this.seek_to_table(tables.font_parameter);
        var stream = this;
        if (this.tfm.character_coding_scheme == 'TeX math italic') {
        }
        else {
            this.tfm.set_font_parameters([...Array(7).keys()].map(function () { return stream.read_fix_word(); }));
        }
        if (this.tfm.character_coding_scheme == 'TeX math symbols') {
            this.tfm.set_math_symbols_parameters([...Array(15).keys()].map(function () { return stream.read_fix_word(); }));
        }
        if ((this.tfm.character_coding_scheme == 'TeX math extension') ||
            (this.tfm.character_coding_scheme == 'euler substitutions only')) {
            this.tfm.set_math_extension_parameters([...Array(6).keys()].map(function () { return stream.read_fix_word(); }));
        }
    }
    read_lig_kern_programs() {
        this.seek_to_table(tables.lig_kern);
        var first_skip_byte = this.read_unsigned_byte1();
        var next_char = this.read_unsigned_byte1();
        var op_byte = this.read_unsigned_byte1();
        var remainder = this.read_unsigned_byte1();
        if (first_skip_byte == 255) {
            var right_boundary_char = next_char;
            console.log('Warning: font has right boundary char');
        }
        this.seek_to_table(tables.lig_kern, this.table_lengths[tables.lig_kern] - 1);
        var last_skip_byte = this.read_unsigned_byte1();
        next_char = this.read_unsigned_byte1();
        op_byte = this.read_unsigned_byte1();
        remainder = this.read_unsigned_byte1();
        if (last_skip_byte == 255) {
            let left_boundary_char_program_index = 256 * op_byte + remainder;
            console.log('Warning: font has left boundary char');
        }
        var first_instruction = true;
        for (var i = 0; i < this.table_lengths[tables.lig_kern]; i++) {
            this.seek_to_table(tables.lig_kern, i);
            var skip_byte = this.read_unsigned_byte1();
            next_char = this.read_unsigned_byte1();
            op_byte = this.read_unsigned_byte1();
            remainder = this.read_unsigned_byte1();
            if (first_instruction && (skip_byte > 128)) {
                var large_index = 256 * op_byte + remainder;
                skip_byte = this.read_unsigned_byte1();
                next_char = this.read_unsigned_byte1();
                op_byte = this.read_unsigned_byte1();
                remainder = this.read_unsigned_byte1();
            }
            var stop = skip_byte >= 128;
            if (op_byte >= KERN_OPCODE) {
                var kern_index = 256 * (op_byte - KERN_OPCODE) + remainder;
                var kern = this.read_fix_word_in_table(tables.kern, kern_index);
                new Tfm.TfmKern(this.tfm, i, stop, next_char, kern);
            }
            else {
                var number_of_chars_to_pass_over = op_byte >> 2;
                var current_char_is_deleted = (op_byte & 0x02) == 0;
                var next_char_is_deleted = (op_byte & 0x01) == 0;
                var ligature_char_code = remainder;
                new Tfm.TfmLigature(this.tfm, i, stop, next_char, ligature_char_code, number_of_chars_to_pass_over, current_char_is_deleted, next_char_is_deleted);
            }
            first_instruction = (stop == true);
        }
    }
    read_characters() {
        for (var c = this.smallest_character_code; c < this.largest_character_code; c++) {
            this.process_char(c);
        }
    }
    process_char(c) {
        var info = this.read_char_info(c);
        var width_index = info.width_index;
        var height_index = info.height_index;
        var depth_index = info.depth_index;
        var italic_index = info.italic_index;
        var tag = info.tag;
        var remainder = info.remainder;
        var width = 0;
        if (width_index != 0)
            width = this.read_fix_word_in_table(tables.width, width_index);
        var height = 0;
        if (height_index != 0)
            height = this.read_fix_word_in_table(tables.height, height_index);
        var depth = 0;
        if (depth_index != 0)
            depth = this.read_fix_word_in_table(tables.depth, depth_index);
        var italic_correction = 0;
        if (italic_index != 0)
            italic_correction = this.read_fix_word_in_table(tables.italic_correction, italic_index);
        var lig_kern_program_index;
        var next_larger_char;
        var extensible_recipe;
        if (tag == LIG_TAG)
            lig_kern_program_index = remainder;
        if (tag == LIST_TAG)
            next_larger_char = remainder;
        if (tag == EXT_TAG)
            extensible_recipe = this.read_extensible_recipe(remainder);
        if (extensible_recipe !== undefined) {
            new Tfm.TfmExtensibleChar(this.tfm, c, width, height, depth, italic_correction, extensible_recipe, lig_kern_program_index, next_larger_char);
        }
        else {
            new Tfm.TfmChar(this.tfm, c, width, height, depth, italic_correction, lig_kern_program_index, next_larger_char);
        }
    }
    read_char_info(c) {
        var index = c - this.smallest_character_code;
        var bytes = [];
        this.seek_to_table(tables.character_info, index);
        bytes[0] = this.read_unsigned_byte1();
        bytes[1] = this.read_unsigned_byte1();
        bytes[2] = this.read_unsigned_byte1();
        bytes[3] = this.read_unsigned_byte1();
        return {
            width_index: bytes[0],
            height_index: bytes[1] >> 4,
            depth_index: bytes[1] & 0xF,
            italic_index: bytes[2] >> 6,
            tag: bytes[2] & 0x3,
            remainder: bytes[3]
        };
    }
}
function parse(buffer) {
    var p = new TFMParser(buffer);
    return p.tfm;
}
export function tfmData(fontname) {
    if (fontdata[fontname]) {
        let buffer = Buffer.from(fontdata[fontname], 'base64');
        return buffer;
    }
    throw Error(`Could not find font ${fontname}`);
}
export function loadFont(fontname) {
    return parse(tfmData(fontname));
}
//# sourceMappingURL=index.js.map