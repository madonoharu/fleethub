export const GearKeys = ["g1", "g2", "g3", "g4", "g5", "gx"] as const
export type GearKey = typeof GearKeys[number]

export const ShipKeys = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const
export type ShipKey = typeof ShipKeys[number]

export const FleetKeys = ["f1", "f2", "f3", "f4"] as const
export type FleetKey = typeof FleetKeys[number]

export const AirbaseKeys = ["a1", "a2", "a3"] as const
export type AirbaseKey = typeof AirbaseKeys[number]

export const FleetTypes = ["Single", "CarrierTaskForce", "SurfaceTaskForce", "TransportEscort", "Combined"] as const
export type FleetType = typeof FleetTypes[number]

export const AirStates = ["AirSupremacy", "AirSuperiority", "AirParity", "AirDenial", "AirIncapability"] as const
export type AirState = typeof AirStates[number]
