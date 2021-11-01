export class TfmChar {
    constructor(tfm, char_code, width, height, depth, italic_correction, lig_kern_program_index, next_larger_char) {
        this.tfm = tfm;
        tfm.set_char(char_code, this);
        this.char_code = char_code;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.italic_correction = italic_correction;
        this.lig_kern_program_index = lig_kern_program_index;
        this.next_larger_char = next_larger_char;
    }
    scaled_width(scale_factor) {
        return this.width * scale_factor;
    }
    scaled_height(scale_factor) {
        return (this.height * scale_factor);
    }
    scaled_depth(scale_factor) {
        return Number(this.depth * scale_factor);
    }
    scaled_dimensions(scale_factor) {
        return [this.width, this.height, this.depth].map(function (x) { return x * scale_factor; });
    }
    next_larger_tfm_char() {
        ;
        if (this.next_larger_char !== null) {
            return this.tfm.get_char(this.next_larger_char);
        }
        else {
            return null;
        }
    }
    get_lig_kern_program(self) {
        ;
        if (this.lig_kern_program_index !== null) {
            return this.tfm.get_lig_kern_program(this.lig_kern_program_index);
        }
        else {
            return null;
        }
    }
}
export class TfmExtensibleChar extends TfmChar {
    constructor(tfm, char_code, width, height, depth, italic_correction, extensible_recipe, lig_kern_program_index, next_larger_char) {
        super(tfm, char_code, width, height, depth, italic_correction, lig_kern_program_index, next_larger_char);
        this.top = 0;
        this.mid = 0;
        this.bot = 0;
        this.rep = 0;
        this.top, this.mid, this.bot, this.rep = extensible_recipe;
    }
}
export class TfmLigKern {
    constructor(tfm, index, stop, next_char) {
        this.tfm = tfm;
        this.index = index;
        this.stop = stop;
        this.next_char = next_char;
        this.tfm.add_lig_kern(this);
    }
}
export class TfmKern extends TfmLigKern {
    constructor(tfm, index, stop, next_char, kern) {
        super(tfm, index, stop, next_char);
        this.kern = kern;
    }
}
export class TfmLigature extends TfmLigKern {
    constructor(tfm, index, stop, next_char, ligature_char_code, number_of_chars_to_pass_over, current_char_is_deleted, next_char_is_deleted) {
        super(tfm, index, stop, next_char);
        this.ligature_char_code = ligature_char_code;
        this.number_of_chars_to_pass_over = number_of_chars_to_pass_over;
        this.current_char_is_deleted = current_char_is_deleted;
        this.next_char_is_deleted = next_char_is_deleted;
    }
}
export class Tfm {
    constructor(smallest_character_code, largest_character_code, checksum, designSize, character_coding_scheme, family) {
        this.smallest_character_code = 0;
        this.largest_character_code = 0;
        this.checksum = 0;
        this.designSize = 0;
        this.character_coding_scheme = '';
        this.family = '';
        this.slant = 0;
        this.spacing = 0;
        this.space_stretch = 0;
        this.space_shrink = 0;
        this.x_height = 0;
        this.quad = 0;
        this.extra_space = 0;
        this.num1 = 0;
        this.num2 = 0;
        this.num3 = 0;
        this.denom1 = 0;
        this.denom2 = 0;
        this.sup1 = 0;
        this.sup2 = 0;
        this.sup3 = 0;
        this.sub1 = 0;
        this.sub2 = 0;
        this.supdrop = 0;
        this.subdrop = 0;
        this.delim1 = 0;
        this.delim2 = 0;
        this.axis_height = 0;
        this.default_rule_thickness = 0;
        this.big_op_spacing = 0;
        this._lig_kerns = [];
        this.characters = {};
        this.smallest_character_code = smallest_character_code;
        this.largest_character_code = largest_character_code;
        this.checksum = checksum;
        this.designSize = designSize;
        this.character_coding_scheme = character_coding_scheme;
        this.family = family;
        this._lig_kerns = [];
        this.characters = {};
    }
    get_char(x) {
        return this.characters[x];
    }
    set_char(x, y) {
        this.characters[x] = y;
    }
    set_font_parameters(parameters) {
        ;
        this.slant = parameters[0];
        this.spacing = parameters[1];
        this.space_stretch = parameters[2];
        this.space_shrink = parameters[3];
        this.x_height = parameters[4];
        this.quad = parameters[5];
        this.extra_space = parameters[6];
    }
    set_math_symbols_parameters(parameters) {
        ;
        this.num1 = parameters[0];
        this.num2 = parameters[1];
        this.num3 = parameters[2];
        this.denom1 = parameters[3];
        this.denom2 = parameters[4];
        this.sup1 = parameters[5];
        this.sup2 = parameters[6];
        this.sup3 = parameters[7];
        this.sub1 = parameters[8];
        this.sub2 = parameters[9];
        this.supdrop = parameters[10];
        this.subdrop = parameters[11];
        this.delim1 = parameters[12];
        this.delim2 = parameters[13];
        this.axis_height = parameters[14];
    }
    set_math_extension_parameters(parameters) {
        this.default_rule_thickness = parameters[0];
        this.big_op_spacing = parameters.slice(1);
    }
    add_lig_kern(obj) {
        ;
        this._lig_kerns.push(obj);
    }
    get_lig_kern_program(i) {
        ;
        return this._lig_kerns[i];
    }
}
//# sourceMappingURL=tfm.js.map