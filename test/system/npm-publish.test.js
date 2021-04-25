const { expect } = require('chai'),
    // eslint-disable-next-line security/detect-child-process
    { execSync: exec } = require('child_process');

describe('npm publish', function () {
    const packageInfo = JSON.parse(exec('npm pack --dry-run --json'))[0];

    it('should have a valid package name', function () {
        expect(packageInfo.name).to.equal('uniscope');
    });

    it('should not publish unnecessary files', function () {
        const allowedFiles = ['index.js', 'package.json', 'LICENSE.md', 'README.md', 'CHANGELOG.yaml'];

        packageInfo.files.map(({ path }) => {
            expect(allowedFiles.includes(path) || path.startsWith('lib/')).to.be.true;
        });
    });
});
