import * as core from '@actions/core';
import * as fs from 'fs';
import AdmZip from 'adm-zip';
import * as action from '../src/action';
import path from 'path';

jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');
  return {
    ...originalFs,
    existsSync: jest.fn().mockReturnValue(true),
    lstatSync: jest.fn().mockReturnValue({ isDirectory: () => false }),
  };
});

jest.mock('adm-zip');

describe('zip-action', () => {
  let inputs: Record<string, string>;
  let getInputSpy: jest.SpyInstance;
  let infoSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let setOutputSpy: jest.SpyInstance;

  let existsSyncMock: jest.Mock;
  let lstatSyncMock: jest.Mock;
  let addLocalFileSpy: jest.Mock;
  let addLocalFolderSpy: jest.Mock;
  let writeZipSpy: jest.Mock;

  beforeEach(() => {
    inputs = {};
    process.env.GITHUB_WORKSPACE = '/fake/workspace';

    // @actions/core
    getInputSpy = jest.spyOn(core, 'getInput');
    getInputSpy.mockImplementation((name) => inputs[name] || '');
    infoSpy = jest.spyOn(core, 'info').mockImplementation(() => {});
    errorSpy = jest.spyOn(core, 'error').mockImplementation(() => {});
    setOutputSpy = jest.spyOn(core, 'setOutput').mockImplementation(() => {});

    // fs
    existsSyncMock = fs.existsSync as jest.Mock;
    lstatSyncMock = fs.lstatSync as jest.Mock;
    existsSyncMock.mockReturnValue(true);
    lstatSyncMock.mockImplementation((filePath) => ({
      isDirectory: () => filePath.includes('dir1'),
    }));

    // AdmZip
    addLocalFileSpy = jest.fn();
    addLocalFolderSpy = jest.fn();
    writeZipSpy = jest.fn();

    (AdmZip as unknown as jest.Mock).mockImplementation(() => ({
      addLocalFile: addLocalFileSpy,
      addLocalFolder: addLocalFolderSpy,
      writeZip: writeZipSpy,
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('zips files, modification and license correctly', async () => {
    inputs['module-name'] = 'test-module';
    inputs['files'] = 'file1.txt dir1';
    inputs['modification-file'] = 'mod.xml';
    inputs['license-file'] = 'license.txt';

    await action.run();

    const destPath = path.join('/fake/workspace', 'test-module.ocmod.zip');

    expect(addLocalFileSpy).toHaveBeenCalledTimes(3); // file1.txt, mod.xml, license.txt
    expect(writeZipSpy).toHaveBeenCalledWith(destPath);
    expect(setOutputSpy).toHaveBeenCalledWith(
      'output_name',
      'test-module.ocmod.zip',
    );
    expect(setOutputSpy).toHaveBeenCalledWith('output_file', destPath);
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('Zipped file test-module.ocmod.zip successfully'),
    );
  });

  it('errors when GITHUB_WORKSPACE is missing', async () => {
    delete process.env.GITHUB_WORKSPACE;

    await action.run();

    expect(errorSpy).toHaveBeenCalledWith('GITHUB_WORKSPACE is not a string');
  });

  it('errors if a file does not exist', async () => {
    existsSyncMock.mockImplementation(
      (filePath) => !filePath.includes('file1.txt'),
    );

    inputs['module-name'] = 'test-module';
    inputs['files'] = 'file1.txt file2.txt';

    await action.run();

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('file1.txt (Not Found)'),
    );
  });
});
