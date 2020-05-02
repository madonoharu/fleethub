type ApShellModifiersParams = {
  hasApShell: boolean
  hasMainGun: boolean
  hasSecondaryGun: boolean
  hasRader: boolean
}

type ApShellModifiers = { power: number; accuracy: number }
/**
 * 徹甲弾補正
 */
export const getApShellModifiers = (params: ApShellModifiersParams): ApShellModifiers => {
  const { hasApShell, hasMainGun, hasRader, hasSecondaryGun } = params

  if (!hasApShell || !hasMainGun) {
    return { power: 1, accuracy: 1 }
  }

  if (hasSecondaryGun && hasRader) {
    return { power: 1.15, accuracy: 1.3 }
  }
  if (hasSecondaryGun) {
    return { power: 1.15, accuracy: 1.2 }
  }
  if (hasRader) {
    return { power: 1.1, accuracy: 1.25 }
  }
  return { power: 1.08, accuracy: 1.1 }
}
