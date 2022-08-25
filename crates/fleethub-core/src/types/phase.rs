#[derive(Debug, Clone, Copy)]
pub enum Phase {
    JetAssault,
    AerialCombat,
    OpeningTorpedo,
    OpeningAsw,
    DayCombat(DayCombatRound),
    ClosingTorpedo,
    NightCombat,
}

#[derive(Debug, Clone, Copy)]
pub enum DayCombatRound {
    Main1,
    Main2,
    Escort,
}

#[derive(Debug, Clone, Copy)]
pub enum Time {
    Day,
    Night,
}

impl Time {
    pub fn is_day(self) -> bool {
        matches!(self, Self::Day)
    }

    pub fn is_night(self) -> bool {
        matches!(self, Self::Night)
    }
}

#[derive(Debug, Clone, Copy)]
pub enum AswPhase {
    Opening,
    Day,
    Night,
}

impl AswPhase {
    pub fn is_opening(self) -> bool {
        matches!(self, Self::Opening)
    }

    pub fn is_day(self) -> bool {
        matches!(self, Self::Day)
    }

    pub fn is_night(self) -> bool {
        matches!(self, Self::Night)
    }
}
