# [Ecency vision][ecency_vision] – Ecency Web/Desktop client

Immutable, decentralized, uncensored, rewarding communities powered by Hive.

Fast, simple and clean source code with Reactjs + Typescript.

## Website

- [Production version][ecency_vision] - master branch
- [Alpha version][ecency_alpha] - development branch

## Desktop app

Please check latest version on [Release page][ecency_release] or [Ecency link][ecency_desktop].

- Mac users: `Ecency-3.x.x.dmg`
- Windows users: `Ecency.Setup.3.x.x.exe`
- Ubuntu users: `ecency-surfer_3.x.x_amd_64.deb` or `Ecency-3.x.x.AppImage`
- CentOS/RHEL & Fedora: `ecency-surfer-3.x.x.x86_64.rpm`
- Other linux users: `ecency-surfer-3.x.x.tar.gz`

## Developers

Feel free to test it out and submit improvements and pull requests.

### Build instructions

##### Requirements

- node ^12.0.0
- yarn

##### Clone 
`$ git clone https://github.com/ecency/ecency-vision`

`$ cd ecency-vision`

##### Install dependencies
`$ yarn`

##### Make your config file
`$ cp src/config.example.json src/config.json`

##### Start website in dev
`$ yarn start`

##### Start desktop in dev
`$ cd src/desktop`
`$ yarn`
`$ yarn dev`

##### Pushing new code / Pull requests

- Make sure to branch off your changes from `development` branch.
- Code on!

## Issues

To report a non-critical issue, please file an issue on this GitHub project.

If you find a security issue please report details to: security@ecency.com

We will evaluate the risk and make a patch available before filing the issue.

[//]: # 'LINKS'
[ecency_vision]: https://ecency.com
[ecency_desktop]: https://desktop.ecency.com
[ecency_alpha]: https://alpha.ecency.com
[ecency_release]: https://github.com/ecency/ecency-vision/releases