import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { parseReleases, readCurrentReleases } from './releases.js'

test('parseReleases validates and normalizes versions', () => {
  assert.deepEqual(parseReleases('[{"version":" 8.4.1 ","sources":[]}]'), [
    { version: '8.4.1' },
  ])
})

test('parseReleases rejects malformed input', () => {
  assert.throws(() => parseReleases('{}'), /must contain an array/)
  assert.throws(() => parseReleases('[{}]'), /has no valid version/)
  assert.throws(() => parseReleases('not JSON'), /must contain valid JSON/)
})

test('readCurrentReleases ignores whitespace and blank lines', () => {
  const directory = mkdtempSync(join(tmpdir(), 'notify-php-releases-'))
  const file = join(directory, '.releases')
  writeFileSync(file, '8.3.0\n\n 8.4.1 \r\n')

  assert.deepEqual(readCurrentReleases(file), new Set(['8.3.0', '8.4.1']))
})
