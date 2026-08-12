import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export interface Release {
  version: string
}

export const parseReleases = (value: string): Release[] => {
  let parsed: unknown

  try {
    parsed = JSON.parse(value)
  } catch {
    throw new Error('Environment variable "RELEASES" must contain valid JSON.')
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Environment variable "RELEASES" must contain an array.')
  }

  return parsed.map((release, index) => {
    if (
      typeof release !== 'object' ||
      release === null ||
      !('version' in release) ||
      typeof release.version !== 'string' ||
      release.version.trim() === ''
    ) {
      throw new Error(`Release at index ${index} has no valid version.`)
    }

    return { version: release.version.trim() }
  })
}

export const readCurrentReleases = (localFile: string): Set<string> =>
  new Set(
    readFileSync(resolve(localFile), 'utf8')
      .split(/\r?\n/)
      .map((version) => version.trim())
      .filter(Boolean),
  )
