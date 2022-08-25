mod common;

#[test]
fn test_gear_fleet_anti_air_mod() {
    let table = [
        ("10cm連装高角砲", 0.35, 2.0),
        ("91式高射装置", 0.35, 2.0),
        ("90mm単装高角砲", 0.35, 3.0),
        ("三式弾", 0.6, 0.0),
        ("22号対水上電探", 0.4, 0.0),
        ("13号対空電探", 0.4, 1.5),
        ("46cm三連装砲", 0.25, 0.0),
        ("12cm単装砲", 0.2, 0.0),
        ("7.7mm機銃", 0.2, 0.0),
    ];

    for (name, expected_a, expected_b) in table {
        for stars in 0..=10 {
            let gear = gear! {
                gear_id = name
                stars = stars
            };

            let aa = gear.anti_air as f64;

            assert_eq!(
                gear.fleet_anti_air_mod(),
                expected_a * aa + expected_b * (stars as f64).sqrt(),
                "{}",
                gear.name
            )
        }
    }
}

#[test]
fn test_gear_ship_anti_air_mod() {
    let table = [
        ("10cm連装高角砲", 2.0, 1.0),
        ("91式高射装置", 2.0, 1.0),
        ("90mm単装高角砲", 2.0, 1.5),
        ("2cm 四連装FlaK 38", 3.0, 2.0),
        ("12cm30連装噴進砲", 3.0, 3.0),
        ("22号対水上電探", 1.5, 0.0),
        ("13号対空電探", 1.5, 0.0),
        ("46cm三連装砲", 0.0, 0.0),
        ("12cm単装砲", 0.0, 0.0),
    ];

    for (name, expected_a, expected_b) in table {
        for stars in 0..=10 {
            let gear = gear! {
                gear_id = name
                stars = stars
            };

            let aa = gear.anti_air as f64;

            assert_eq!(
                gear.ship_anti_air_mod(),
                expected_a * aa + expected_b * (stars as f64).sqrt(),
                "{}",
                gear.name
            )
        }
    }
}
