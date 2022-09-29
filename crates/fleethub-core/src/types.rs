macro_rules! export_types {
    ( $($p: ident,)* ) => {
        $(
            mod $p;
            pub use $p::*;
        )*
    };
}

export_types!(
    air_combat,
    air_squadron_state,
    air_state,
    attack_power_modifier,
    attack_style,
    attack_type,
    battle_conditions,
    battle_definitions,
    comp_type,
    compiled_evaler,
    const_id,
    contact_rank,
    cutin,
    damage_state,
    defense_power,
    ebonus,
    engagement,
    fleet_factors,
    fleet_state,
    fleet_type,
    formation,
    gear_attr,
    gear_state,
    gear_type,
    gear_type_id_array,
    matchup,
    meta,
    morale_state,
    node_state,
    org_state,
    org_type,
    participant,
    phase,
    position,
    proficiency_modifiers,
    role,
    ship_attr,
    ship_conditions,
    ship_state,
    ship_type,
    side,
    slot_size_vec,
    special_enemy_type,
    speed,
);
