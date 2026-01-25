interface ShipMain {
    [key: string]: any
    "ship_air_control": number
    "favorite_gift": number[]
    "view_range": number
    "ship_torpedo_attack": number
    "antisubmarine": number
    "plane_torpedo": number
    "air_combat_coefficient": number
    "angle_speed": number
    "break_down_get": number[][]
    "character": number[]
    "fixed_money": number
    "main_gun_cd": number
    "attack_levelup": number
    "ship_class": number
    "hp": number
    "dodge": number
    "speed_show": number
    "carry_plane_count": number
    "st_id": number
    "drop_path": number[]
    "not_match_value_group": number[]
    "projectiles": number[]
    "pskill_sp_talent_id": number
    "battle_angle_speed": number
    "attack_ship_coefficient": number
    "ship_bomb_attack_levelup": number
    "opentorpedo_projectiles": number
    "to_air_attack": number
    "unlock_item": number[][][]
    "ship_levelup_max": number
    "direct_activate_talent_id": number[]
    "match_value_group": number[]
    "fate": number
    "sm_id": number
    "ship_bomb_attack": number
    "to_air_attack_levelup": number
    "pskill_show_id": number[]
    "to_torpedo_attack": number
    "antisubmarine_levelup": number
    "script_list": string[]
    "defense_levelup": number
    "crit": number
    "fire_coefficient": number
    "plane_health": number
    "characterlevel": number[]
    "ship_info_id": number
    "torpedo_range": number
    "backup_plane_count": number
    "torpedo_defense": number
    "hp_levelup": number
    "to_torpedo_attack_levelup": number
    "torpedo_num": number
    "charactermaxlevel": number[][]
    "hit": number
    "param_list": number[][]
    "main_gun_available": number
    "submarine": number
    "torpedo_attack": number
    "extract_get_exceed_count": number
    "level_value_effect": number[]
    "ship_air_control_levelup": number
    "transform_list": number[]
    "ship_tag_array": number[]
    "plane_to_air": number
    "anti_crit": number
    "ship_weapon": string
    "break_level": number
    "ship_type2": number
    "supple_cost": number
    "transform_id": number
    "extract_reward": number
    "torpedo_available": number
    "submarine_levelup": number
    "extract_get_exceed_reward": number
    "condition_activate_talent_id": number[]
    "airAttack_stg_id": number
    "second_gun_available": number
    "torpedo_coefficient": number
    "main_gun_range": number
    "main_gun_stg_id": number
    "speed": number
    "torpedo_attack_levelup": number
    "attack": number
    "ship_torpedo_attack_levelup": number
    "plane_bomb": number
    "torpedo_defense_levelup": number
    "defense": number
}

const ShipMain: Record<number, ShipMain> = {
    
}

export function getShipMain(id: number): ShipMain {
    if (ShipMain[id]) {
        return ShipMain[id]
    }
    const data: ShipMain = JSON.parse(Deno.readTextFileSync(`./game-config/config_ship_main/${id}.json`))
    ShipMain[id] = data
    return data
}