import { skillClusters } from '../data/skills'

/**
 * Full-bleed toolchain strip under the hero. A quiet, factual band of the
 * technologies that appear across the work — no percentages, no logo soup.
 */
export function Toolchain() {
  const tools = Array.from(
    new Set(skillClusters.flatMap((cluster) => cluster.tags).filter((tag) => tag.length <= 12)),
  ).slice(0, 18)

  return (
    <div className="toolchain">
      <div className="toolchain__inner shell">
        <span className="toolchain__label mono">Toolchain · as listed on the résumé</span>
        <ul className="toolchain__list" aria-label="Technologies worked with">
          {tools.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
