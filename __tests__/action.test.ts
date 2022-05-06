import * as core from '@actions/core'
import * as action from '../src/action'
import archiver from 'archiver'

describe('prepare ocmod file', () => {
  let inputs = {} as any;
  let os = {} as any;

  let archiverSpy: jest.SpyInstance;
  let dirSpy: jest.SpyInstance;
  let fileSpy: jest.SpyInstance;
  let pipeSpy: jest.SpyInstance;
  let finalizeSpy: jest.SpyInstance;

  beforeAll(() => {
    process.env['GITHUB_PATH'] = ''
    console.log('::stop-commands::stoptoken')
  })

  beforeEach(() => {
    const archive = archiver('zip')

    archiverSpy = jest.spyOn(archive, 'pipe')
  })

  afterAll(async () => {
    console.log('::stoptoken::')
  }, 100000)

  it('handles unhandled error and reports error', async () => {
    const errMsg = 'unhandled error message'
    inputs['module-name'] = 'super-module'

    await action.run()
  })
})
