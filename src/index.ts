import * as process from 'node:process'
import { info, setFailed } from '@actions/core'
import { getOctokit } from '@actions/github'
import { parseReleases, readCurrentReleases } from './releases.js'

const requireEnvironmentVariable = (name: string): string => {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Environment variable "${name}" was not set.`)
  }

  return value
}

export const run = async (): Promise<void> => {
  const token = requireEnvironmentVariable('REPO_TOKEN')
  const owner = requireEnvironmentVariable('OWNER')
  const repo = requireEnvironmentVariable('REPO')
  const localFile = requireEnvironmentVariable('LOCALFILE')
  const releases = parseReleases(requireEnvironmentVariable('RELEASES'))
  const currentReleases = readCurrentReleases(localFile)
  const octokit = getOctokit(token)

  for (const version of new Set(releases.map((release) => release.version))) {
    if (currentReleases.has(version)) {
      continue
    }

    const title = `build: bump PHP release to ${version}`
    const response = await octokit.rest.search.issuesAndPullRequests({
      q: `repo:${owner}/${repo} is:issue in:title ${JSON.stringify(title)}`,
      per_page: 100,
    })
    const matchingIssues = response.data.items.filter(
      (issue) => issue.title === title,
    )

    if (matchingIssues.length > 0) {
      info(
        `Found matching issue(s) for PHP ${version}:\n${matchingIssues
          .map((issue) => issue.html_url)
          .join('\n')}`,
      )
      continue
    }

    const issue = await octokit.rest.issues.create({
      owner,
      repo,
      title,
      body: `Bump PHP version to ${version}.`,
    })

    info(`Created issue for PHP ${version}: ${issue.data.html_url}`)
  }
}

run().catch((error: unknown) => {
  setFailed(error instanceof Error ? error.message : String(error))
})
