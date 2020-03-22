type ShipRole = "Main" | "Escort"

type WarfareModifiers = {
  power: number
  accuracy: number
  evasion: number
}

type FormationModifiers = {
  fleetAntiAir: number
  shelling: WarfareModifiers
  torpedo: WarfareModifiers
  asw: WarfareModifiers
  night: WarfareModifiers
}

const keys = [
  "LineAhead",
  "DoubleLine",
  "Diamond",
  "Echelon",
  "LineAbreast",
  "Vanguard",
  "CruisingFormation1",
  "CruisingFormation2",
  "CruisingFormation3",
  "CruisingFormation4"
] as const

/** 陣形 */
export default class Formation {
  public static keys = keys.concat()

  public static values: Formation[] = []

  public static readonly LineAhead = new Formation(1, "単縦陣", {
    fleetAntiAir: 1,
    shelling: { power: 1, accuracy: 1, evasion: 1 },
    torpedo: { power: 1, accuracy: 1, evasion: 1 },
    asw: { power: 0.6, accuracy: 1, evasion: 1 },
    night: { power: 1, accuracy: 1, evasion: 1 }
  })

  public static readonly DoubleLine = new Formation(2, "複縦陣", {
    fleetAntiAir: 1.2,
    shelling: { power: 0.8, accuracy: 1.2, evasion: 1 },
    torpedo: { power: 0.8, accuracy: 0.8, evasion: 1 },
    asw: { power: 0.8, accuracy: 1.2, evasion: 1 },
    night: { power: 1, accuracy: 0.9, evasion: 1 }
  })

  public static readonly Diamond = new Formation(3, "輪形陣", {
    fleetAntiAir: 1.6,
    shelling: { power: 0.7, accuracy: 1, evasion: 1.1 },
    torpedo: { power: 0.7, accuracy: 0.4, evasion: 1.1 },
    asw: { power: 1.2, accuracy: 1, evasion: 1 },
    night: { power: 1, accuracy: 0.7, evasion: 1 }
  })

  public static readonly Echelon = new Formation(4, "梯形陣", {
    fleetAntiAir: 1,
    shelling: { power: 0.75, accuracy: 1.2, evasion: 1.2 },
    torpedo: { power: 0.6, accuracy: 0.6, evasion: 1.3 },
    asw: { power: 1.1, accuracy: 1.2, evasion: 1.3 },
    // https://twitter.com/shiro_sh39/status/1121812791843627008
    night: { power: 1, accuracy: 0.9, evasion: 1.2 }
  })

  public static readonly LineAbreast = new Formation(5, "単横陣", {
    fleetAntiAir: 1,
    shelling: { power: 0.6, accuracy: 1.2, evasion: 1.3 },
    torpedo: { power: 0.6, accuracy: 0.3, evasion: 1.4 },
    asw: { power: 1.3, accuracy: 1.2, evasion: 1.1 },
    night: { power: 1, accuracy: 0.8, evasion: 1.2 }
  })

  public static readonly Vanguard = new Formation(6, "警戒陣", {
    fleetAntiAir: 1.1,
    shelling: { power: 1, accuracy: 1, evasion: 1 },
    torpedo: { power: 1, accuracy: 1, evasion: 1 },
    asw: { power: 1, accuracy: 1, evasion: 1 },
    night: { power: 1, accuracy: 1, evasion: 1 }
  })

  public static readonly CruisingFormation1 = new Formation(11, "第一警戒航行序列", {
    fleetAntiAir: 1.1,
    shelling: { power: 0.8, accuracy: 1, evasion: 1 },
    torpedo: { power: 0.7, accuracy: 1, evasion: 1 },
    asw: { power: 1.3, accuracy: 1, evasion: 1 },
    night: { power: 1, accuracy: 1, evasion: 1 }
  })

  public static readonly CruisingFormation2 = new Formation(12, "第二警戒航行序列", {
    fleetAntiAir: 1,
    shelling: { power: 1, accuracy: 1, evasion: 1 },
    torpedo: { power: 0.9, accuracy: 1, evasion: 1 },
    asw: { power: 1.1, accuracy: 1, evasion: 1 },
    night: { power: 1, accuracy: 1, evasion: 1 }
  })

  public static readonly CruisingFormation3 = new Formation(13, "第三警戒航行序列", {
    fleetAntiAir: 1.5,
    shelling: { power: 0.7, accuracy: 1, evasion: 1 },
    torpedo: { power: 0.6, accuracy: 1, evasion: 1 },
    asw: { power: 1, accuracy: 1, evasion: 1 },
    night: { power: 1, accuracy: 1, evasion: 1 }
  })

  public static readonly CruisingFormation4 = new Formation(14, "第四警戒航行序列", {
    fleetAntiAir: 1,
    //https://kancolle.fandom.com/ja/wiki/%E3%82%B9%E3%83%AC%E3%83%83%E3%83%89:987#13
    shelling: { power: 1.1, accuracy: 1.1, evasion: 1 },
    torpedo: { power: 1, accuracy: 1, evasion: 1 },
    asw: { power: 0.7, accuracy: 1, evasion: 1 },
    night: { power: 1, accuracy: 1, evasion: 1 }
  })

  public static get singleFleetFormations() {
    return Formation.values.filter(formation => formation.id <= 10)
  }

  public static get combinedFleetFormations() {
    return Formation.values.filter(formation => formation.id > 10)
  }

  public static fromId(id: number) {
    return Formation.values.find(form => form.id === id)
  }

  public static isIneffective = (attackForm: Formation, defenseForm: Formation) =>
    [
      [Formation.DoubleLine, Formation.LineAbreast],
      [Formation.LineAbreast, Formation.Echelon],
      [Formation.Echelon, Formation.LineAhead]
    ].some(forms => forms[0] === attackForm && forms[1] === defenseForm)

  private constructor(
    public readonly id: number,
    public readonly name: string,
    private readonly modifiers: FormationModifiers
  ) {
    Formation.values.push(this)
  }

  get fleetAntiAirModifier() {
    return this.modifiers.fleetAntiAir
  }

  get isCombinedFleetFormation() {
    return this.id > 10
  }

  get shellingSupportModifiers() {
    if (this === Formation.Vanguard) {
      return { power: 0.5, accuracy: 0.8 }
    }
    if (this.isCombinedFleetFormation) {
      return { power: 1, accuracy: 1 }
    }
    return this.getModifiers("Main").shelling
  }

  public getModifiers = (role: ShipRole): FormationModifiers => {
    if (this !== Formation.Vanguard) {
      return this.modifiers
    }
    if (role === "Main") {
      return {
        ...this.modifiers,
        shelling: { power: 0.5, accuracy: 0.8, evasion: 1 },
        torpedo: { power: 1, accuracy: 1, evasion: 1 },
        asw: { power: 1, accuracy: 1, evasion: 1 },
        night: { power: 0.5, accuracy: 1, evasion: 1 }
      }
    }
    return {
      ...this.modifiers,
      shelling: { power: 1, accuracy: 1.2, evasion: 1 },
      torpedo: { power: 1, accuracy: 1, evasion: 1 },
      asw: { power: 0.6, accuracy: 1, evasion: 1 },
      night: { power: 1, accuracy: 1, evasion: 1 }
    }
  }

  get protectionRate() {
    if (this === Formation.LineAhead) {
      return 0.45
    }

    if (this === Formation.Diamond) {
      return 0.75
    }

    return 0.6
  }
}
