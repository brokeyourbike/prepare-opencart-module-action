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
      - uses: actions/checkout@v3

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

## Arguments

| Input  | Description | Usage |
| :---:     |     :---:   |    :---:   |
| `module-name`  | name of the OpenCart module  | *Required |
| `files`  | files or directories to includ  | |
| `modification-file`  | add modification to the module root  | |
| `license-file`  | add license to the module root  | |


## Authors

- [Ivan Stasiuk](https://github.com/brokeyourbike) | [Twitter](https://twitter.com/brokeyourbike) | [LinkedIn](https://www.linkedin.com/in/brokeyourbike) | [stasi.uk](https://stasi.uk)

## License

[MIT License](https://github.com/brokeyourbike/prepare-opencart-module-action/blob/main/LICENSE)