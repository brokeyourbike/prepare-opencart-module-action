# prepare-opencart-module-action

[![Maintainability](https://api.codeclimate.com/v1/badges/cba9783e98be5bc4f2cf/maintainability)](https://codeclimate.com/github/brokeyourbike/prepare-opencart-module-action/maintainability)

Prepare Opencart module

## Usage

```yaml
name: release

on:
  release:
    types: [ published ]

jobs:
  zip-files:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v2

      - name: Prepare Ocmod
        uses: brokeyourbike/prepare-opencart-module-action@v1
        id: prepare
        with:
          module-name: example-module-name
          modification-file: modification.xml
          files: admin/ catalog/

      - name: Upload Release Asset
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          asset_path: ${{ steps.prepare.outputs.output_file }}
          asset_name: ${{ steps.prepare.outputs.output_name }}
          asset_content_type: application/zip
```
