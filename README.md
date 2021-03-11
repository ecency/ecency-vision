# [Ecency vision][ecency_vision] – Ecency Web/Desktop client

![ecency](https://raw.githubusercontent.com/ecency/ecency-vision/development/public/github-cover.png?token=AAI7QTDQXRWRZFJ2W4QH6LC7VVA3I)

Immutable, decentralized, uncensored, rewarding communities powered by Hive.

Fast, simple and clean source code with Reactjs + Typescript.

## Website

- [Production version][ecency_vision] - master branch
- [Alpha version][ecency_alpha] - development branch

## Desktop app

Please check latest version on [Release page][ecency_release] or [Ecency link][ecency_desktop].

- Mac users: `Ecency-3.x.x.dmg`
- Windows users: `Ecency.Setup.3.x.x.exe`
- Linux users: `ecency-surfer_3.x.x_amd_64.deb`, `Ecency-3.x.x.AppImage`, `ecency-surfer-3.x.x.x86_64.rpm`, `ecency-surfer-3.x.x.tar.gz`

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

##### Edit config file or define environment variables
`$ nano src/config.ts`

##### Environment variables

* `USE_PRIVATE` -  if instance has private api address and auth (0 or 1 value)
* `PRIVATE_API_ADDR` - private api endpoint
* `PRIVATE_API_AUTH` - private api auth
* `HIVESIGNER_CLIENT_SECRET` -  hivesigner client secret
* `SEARCH_API_ADDR` - hivesearcher api endpoint
* `SEARCH_API_SECRET` - hivesearcher api auth token

##### Start website in dev
`$ yarn start`

##### Start desktop in dev
`$ cd src/desktop`
`$ yarn`
`$ yarn dev`

##### Pushing new code / Pull requests

- Make sure to branch off your changes from `development` branch.
- Make sure to run `yarn test` and add tests to your changes.
- Code on!

## Docker

You can use official `ecency/vision:latest` image to run Vision locally, deploy it to staging or even production environment. The simplest way is to run it with following command:

```bash
docker run -it --rm -p 3000:3000 ecency/vision:latest
```

Configure the instance using following environment variables:
 * `USE_PRIVATE`
 * `PRIVATE_API_ADDR`
 * `PRIVATE_API_AUTH`
 * `HIVESIGNER_CLIENT_SECRET`
 * `SEARCH_API_ADDR`
 * `SEARCH_API_SECRET`

```bash
docker run -it --rm -p 3000:3000 -e PRIVATE_API_ADDR=https://api.example.com -e PRIVATE_API_AUTH=verysecretpassword ecency/vision:latest
```

### Swarm

You can easily deploy a set of vision instances to your production environment, using example `docker-compose.yml` file. Docker Swarm will automatically keep it alive and load balance incoming traffic between the containers:

```bash
docker stack deploy -c docker-compose.yml -c docker-compose.production.yml vision
```

## Issues

To report a non-critical issue, please file an issue on this GitHub project.

If you find a security issue please report details to: security@ecency.com

We will evaluate the risk and make a patch available before filing the issue.

[//]: # 'LINKS'
[ecency_vision]: https://ecency.com
[ecency_desktop]: https://desktop.ecency.com
[ecency_alpha]: https://alpha.ecency.com
[ecency_release]: https://github.com/ecency/ecency-vision/releases
