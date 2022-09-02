mod common;

#[test]
fn test_equippability() {
    let cv = ship! { ship_id = "赤城" };
    assert!(cv.can_equip(&gear! { gear_id = "熟練甲板要員" }, "gx"));
    assert!(cv.can_equip(&gear! { gear_id = "改良型艦本式タービン" }, "gx"));

    let ss = ship! { ship_id = "伊168" };

    assert!(ss.can_equip(&gear! { gear_id = "潜水艦後部魚雷発射管4門(後期型)" }, "gx"));

    let akitsumaru = ship! { ship_id = "あきつ丸改" };
    assert!(akitsumaru.can_equip(&gear! { gear_id = "寒冷地装備&甲板要員" }, "g1"));
    assert!(!akitsumaru.can_equip(&gear! { gear_id = "熟練甲板要員" }, "g1"));

    let richelieu = ship! { ship_id = "Richelieu改" };
    assert!(richelieu.can_equip(&gear! { gear_id = "Laté 298B" }, "g1"));
    assert!(!richelieu.can_equip(&gear! { gear_id = "瑞雲" }, "g1"));

    let yahagi_k2b = ship! { ship_id = "矢矧改二乙" };
    let torpedo = gear! { gear_id = "61cm四連装(酸素)魚雷後期型" };
    assert!(yahagi_k2b.can_equip(&torpedo, "g1"));
    assert!(!yahagi_k2b.can_equip(&torpedo, "g4"));

    let ise_k2 = ship! { ship_id = "伊勢改二" };
    let large_main_gun = gear! { gear_id = "46cm三連装砲" };
    assert!(ise_k2.can_equip(&large_main_gun, "g2"));
    assert!(!ise_k2.can_equip(&large_main_gun, "g3"));

    let yuubari_k2 = ship! { ship_id = "夕張改二" };
    assert!(yuubari_k2.can_equip(&torpedo, "g3"));
    assert!(!yuubari_k2.can_equip(&torpedo, "g4"));
    assert!(!yuubari_k2.can_equip(&torpedo, "g5"));

    let aa_gun = gear! { gear_id = "7.7mm機銃" };
    assert!(yuubari_k2.can_equip(&aa_gun, "g3"));
    assert!(yuubari_k2.can_equip(&aa_gun, "g4"));
    assert!(yuubari_k2.can_equip(&aa_gun, "g5"));

    let small_main_gun = gear! { gear_id = "12cm単装砲" };
    assert!(yuubari_k2.can_equip(&small_main_gun, "g3"));
    assert!(!yuubari_k2.can_equip(&small_main_gun, "g4"));
    assert!(!yuubari_k2.can_equip(&small_main_gun, "g5"));

    let yamato_k2 = ship! { ship_id = "大和改二" };
    assert!(yamato_k2.can_equip(
        &gear! { gear_id = "15m二重測距儀改+21号電探改二+熟練射撃指揮所" },
        "gx"
    ));
}
