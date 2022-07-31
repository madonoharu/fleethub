mod common;

fn test_case(ship_name: &str, gears: Vec<&str>, expected: Vec<u8>) {
    let get = |index: usize| gears.get(index).unwrap_or(&"").to_string();

    let g1 = get(0);
    let g2 = get(1);
    let g3 = get(2);
    let g4 = get(3);
    let g5 = get(4);
    let gx = get(5);

    let ship = ship! {
        ship_id = ship_name
        g1 = g1
        g2 = g2
        g3 = g3
        g4 = g4
        g5 = g5
        gx = gx
    };

    assert_eq!(ship.get_possible_anti_air_cutin_ids(), expected);
}

macro_rules! table {
  ($([$ship: expr, $($gear: expr),+ $(,)?] => $expected: expr),+ $(,)?) => {
      $(test_case($ship, vec![$($gear),+], $expected.into());)+
  };
}

#[test]
fn test_anti_air_cutin() {
    table! {
        ["秋月", "10cm連装高角砲", "22号対水上電探"] => [2],
        ["秋月", "10cm連装高角砲", "10cm連装高角砲"] => [3],
        ["秋月", "10cm連装高角砲", "10cm連装高角砲", "22号対水上電探"] => [1, 2, 3],

        ["Fletcher", "5inch単装砲 Mk.30改+GFCS Mk.37", "5inch単装砲 Mk.30改+GFCS Mk.37"] => [34],
        ["Fletcher", "5inch単装砲 Mk.30改+GFCS Mk.37", "5inch単装砲 Mk.30改+GFCS Mk.37", "GFCS Mk.37"] => [34, 5, 8],
        ["Fletcher", "5inch単装砲 Mk.30改+GFCS Mk.37", "5inch単装砲 Mk.30"] => [35],
        ["Fletcher", "5inch単装砲 Mk.30改+GFCS Mk.37", "5inch単装砲 Mk.30改"] => [35],
        ["Fletcher", "5inch単装砲 Mk.30改+GFCS Mk.37", "5inch単装砲 Mk.30", "GFCS Mk.37"] => [35, 8],
        ["Fletcher", "5inch単装砲 Mk.30改+GFCS Mk.37", "5inch単装砲 Mk.30改", "GFCS Mk.37"] => [35, 8],
        ["Fletcher", "5inch単装砲 Mk.30", "5inch単装砲 Mk.30", "GFCS Mk.37"] => [36],
        ["Fletcher", "5inch単装砲 Mk.30", "5inch単装砲 Mk.30"] => [],
        ["Fletcher", "5inch単装砲 Mk.30改", "5inch単装砲 Mk.30改"] => [37],
        ["Fletcher", "5inch単装砲 Mk.30改", "5inch単装砲 Mk.30改", "GFCS Mk.37"] => [36, 37],

        ["大和改二", "10cm連装高角砲群 集中配備", "10cm連装高角砲群 集中配備", "15m二重測距儀+21号電探改二", "25mm三連装機銃"] => [42, 43, 44, 45, 5, 8],
        ["大和改二", "10cm連装高角砲群 集中配備", "10cm連装高角砲群 集中配備", "15m二重測距儀+21号電探改二"] => [43, 45, 5, 8],
        ["大和改二", "10cm連装高角砲群 集中配備", "15m二重測距儀+21号電探改二", "25mm三連装機銃"] => [44, 45, 8],
        ["大和改二", "10cm連装高角砲群 集中配備", "15m二重測距儀+21号電探改二"] => [45, 8],
    }
}
