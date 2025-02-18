import chalk from 'chalk';
import { getExpectedVersion } from '../bin-fix-mismatches/get-expected-version';
import { ICON } from '../constants';
import type { Disk } from '../lib/disk';
import type { ProgramInput } from '../lib/get-input';
import { listVersionGroups } from './list-version-groups';

export function list(input: ProgramInput, disk: Disk): void {
  let isInvalid = false;

  /**
   * Reverse the list so the default/ungrouped version group is rendered first
   * (appears at the top). The actual version groups which the user configured
   * will then start from index 1.
   */
  input.instances.versionGroups.reverse().forEach((versionGroup, i) => {
    const isVersionGroup = i > 0;
    const groups = listVersionGroups(versionGroup);

    if (isVersionGroup) {
      console.log(chalk`{dim = Version Group ${i} ${'='.repeat(63)}}`);
    }

    groups.forEach(({ hasMismatches, isBanned, name, uniques }) => {
      const versionList = uniques.sort();
      const expected = getExpectedVersion(name, versionGroup, input);
      console.log(
        isBanned
          ? chalk`{red ${ICON.cross} ${name}} {dim.red is defined in this version group as banned from use}`
          : hasMismatches
          ? chalk`{red ${ICON.cross} ${name}} ${versionList
              .map((version) =>
                version === expected
                  ? chalk.green(version)
                  : chalk.red(version),
              )
              .join(chalk.dim(', '))}`
          : chalk`{dim -} {white ${name}} {dim ${versionList}}`,
      );
    });

    if (groups.some(({ hasMismatches }) => hasMismatches)) {
      isInvalid = true;
    }
  });

  if (isInvalid) {
    disk.process.exit(1);
  }
}
