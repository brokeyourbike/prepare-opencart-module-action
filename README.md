# prepare-opencart-module-action
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
        uses: brokeyourbike/action-release-opencart-module@v1.1.0
        id: prepare
        with:
          module-name: example-module-name
          modification-file: modification.xml
          files: admin/ catalog/
```
