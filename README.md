<a href="https://discord.gg/WywwJEu">![Discord](https://img.shields.io/discord/385034494555455488?label=Ecency%20discord&logo=discord)</a> <a href="https://twitter.com/ecency_official">![Twitter Follow](https://img.shields.io/twitter/follow/ecency_official?style=social)</a> <a href="https://github.com/ecency/ecency-vision">![GitHub Repo stars](https://img.shields.io/github/stars/ecency/ecency-vision?style=social)</a>

# [Ecency vision][ecency_vision] – Ecency Web/Desktop client

![ecency](https://ecency.com/assets/github-cover.png)

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

##### Edit client config file or define environment variables

`$ cp src/client_config_defaults.ts src/client_config.ts`
`$ nano src/client_config.ts`

##### Client Config Constants

These are for values that the server or client code may both use. It must not be sensitive information yet it should be
system-wide, and constant for this installation or site.

###### HIVE_SIGNER_APP

This can be left as 'ecency.app'. Unless you want to change the account proxy, you should leave this as is.

###### APP_URL

This should be the URL of the site. If you are running this testing, it should be "http://localhost" so hiveSigner redirects you back to localhost. The default is 'https://ecency.com'.

###### APP_DOMAIN

This should be the URL of the site without the protocol part. The default is "ecency.com".

##### Environment variables

- `USE_PRIVATE` - if instance has private api address and auth (0 or 1 value)
- `REDIS_URL` - support for caching amp pages

##### Start website in dev

`$ yarn start`

##### Start desktop in dev

`$ cd src/desktop`
`$ yarn`
`$ yarn dev`

##### Pushing new code / Pull requests

- Make sure to branch off your changes from `development` branch.
- Make sure to run `yarn test` and add tests to your changes.
- Make sure new text, strings are added into `en-US.json` file only.
- Code on!

## Docker

You can use official `ecency/vision:latest` image to run Vision locally, deploy it to staging or even production environment. The simplest way is to run it with following command:

```bash
docker run -it --rm -p 3000:3000 ecency/vision:latest
```

Configure the instance using following environment variables:

- `USE_PRIVATE`
- `REDIS_URL`

```bash
docker run -it --rm -p 3000:3000 -e USE_PRIVATE=1 ecency/vision:latest
```

### Swarm

You can easily deploy a set of vision instances to your production environment, using example `docker-compose.yml` file. Docker Swarm will automatically keep it alive and load balance incoming traffic between the containers:

```bash
docker stack deploy -c docker-compose.yml -c docker-compose.production.yml vision
```

### Contributors

[![Contributors](https://contrib.rocks/image?repo=ecency/ecency-vision)](https://github.com/ecency/ecency-vision/graphs/contributors)

## Issues

To report a non-critical issue, please file an issue on this GitHub project.

If you find a security issue please report details to: security@ecency.com

We will evaluate the risk and make a patch available before filing the issue.

[//]: # "LINKS"
[ecency_vision]: https://ecency.com
[ecency_desktop]: https://desktop.ecency.com
[ecency_alpha]: https://alpha.ecency.com
[ecency_release]: https://github.com/ecency/ecency-vision/releases
