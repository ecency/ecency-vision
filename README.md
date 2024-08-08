<a href="https://discord.gg/WywwJEu">![Discord](https://img.shields.io/discord/385034494555455488?label=Ecency%20discord&logo=discord)</a> <a href="https://twitter.com/ecency_official">![Twitter Follow](https://img.shields.io/twitter/follow/ecency_official?style=social)</a> <a href="https://github.com/ecency/ecency-vision">![GitHub Repo stars](https://img.shields.io/github/stars/ecency/ecency-vision?style=social)</a>

# [Ecency vision][ecency_vision] – Ecency Web client

![ecency](https://ecency.com/assets/github-cover.png)

Immutable, decentralized, uncensored, rewarding communities powered by Hive.

Fast, simple and clean source code with Reactjs + Typescript.

## Website

- [Production version][ecency_vision] - master branch
- [Alpha version][ecency_alpha] - development branch

***

## Developers

Feel free to test it out and submit improvements and pull requests.

***

## Build instructions

##### Requirements

- `node ^18.17.x`
- `yarn`

##### Clone

`$ git clone https://github.com/ecency/ecency-vision`

`$ cd ecency-vision`

##### Install dependencies

`$ yarn`

##### Edit config file or define environment variables

1. `$ cp .env.template .env`
2. Update values with your ones

##### Environment variables

- ~~`USE_PRIVATE` - if instance has private api address and auth (0 or 1 value)~~ Use extended configuration instead below.
- ~~`HIVESIGNER_ID`~~ – `NEXT_PUBLIC_HS_CLIENT_ID` – This is a special application Hive account. If unset, "ecency.app" is the account used.
- ~~`HIVESIGNER_SECRET`~~ – `NEXT_PUBLIC_HS_CLIENT_SECRET` – This is a secret your site shares with HIVE_SIGNER in order to communicate securely.
- ~~`REDIS_URL` - support for caching amp pages~~. Amp pages has been deprecated and will be removed by Google. Amp pages aren't longer supporting in Ecency vision. 

###### Hivesigner Variables

When setting up another service like Ecency with Ecency-vision software:

1. You may leave `NEXT_PUBLIC_HS_CLIENT_ID` and `NEXT_PUBLIC_HS_CLIENT_SECRET` environment variables unset and optionally set USE_PRIVATE=1 and leave "base" in the constants/defaults.json set to "https://ecency.com". Your new site will contain more features as it will use Ecency's private API. This is by far the easiest option.
2. You may change `base` to the URL of your own site, but you will have to set environment variables `NEXT_PUBLIC_HS_CLIENT_ID` and `NEXT_PUBLIC_HS_CLIENT_SECRET`; set USE_PRIVATE=0 as well as configure your the `HIVESIGNER_ID` account at the [Hivesigner website.](https://hivesigner.com/profile). Hivesigner will need a `secret`, in the form of a long lowercase hexadecimal number. The HIVESIGNER_SECRET should be set to this value.

###### Hivesigner Login Process

In order to validate a login, and do posting level operations, this software relies on Hivesigner. A user @alice will use login credentials to login to the site via one of several methods, but the site will communicate with Hivesigner and ask it to do all posting operations on behalf of @alice. Hivesigner can and will do this because both @alice will have given posting authority to the `NEXT_PUBLIC_HS_CLIENT_ID` user and the `NEXT_PUBLIC_HS_CLIENT_ID` user will have given its posting authority to Hivesigner.

##### Edit "default" values

If you are setting up your own website other than Ecency.com, you can still leave the value `base` as "https://ecency.com". However, you should change `name`, `title` and `twitterHandle`. There are also a lot of static pages that are Ecency specific.

### Extended vision configuration

Ecency vision has extended configuration based on feature-flag on/off specifications built in yaml format.
```yaml
#Any ecency vision configuration file should be started with specific tag as below
vision-config:
  features:
    ...
```
Feature flags and their formats:
1. 

See `src/config/vision-config.template.yml`.  

***
## Docker

You can use official `ecency/vision:latest` image to run Vision locally, deploy it to staging or even production environment. The simplest way is to run it with following command:

```bash
docker run -it --rm -p 3000:3000 ecency/vision:latest
```

Configure the instance using following environment variables:

- ~~`USE_PRIVATE`~~ See extended configuration above.

```bash
docker run -it --rm -p 3000:3000 -e USE_PRIVATE=1 ecency/vision:latest
```

### Swarm

You can easily deploy a set of vision instances to your production environment, using example `docker-compose.yml` file. Docker Swarm will automatically keep it alive and load balance incoming traffic between the containers:

```bash
docker stack deploy -c docker-compose.yml -c docker-compose.production.yml vision
```

***
## Contributors

[![Contributors](https://contrib.rocks/image?repo=ecency/ecency-vision)](https://github.com/ecency/ecency-vision/graphs/contributors)


***

## Pushing new code / Pull requests

- Make sure to branch off your changes from `development` branch.
- Make sure to run `yarn test` and add tests to your changes.
- Make sure new text, strings are added into `en-US.json` file only.
- Code on!

### Note to developers

- Make PRs more clear with description, screenshots or videos, linking to issues, if no issue exist create one that describes PR and mention in PR. Reviewers may or may not run code, but PR should be reviewable even without running, visials helps there.
- PR should have title WIP, if it is not ready yet. Once ready, run yarn test and update all tests, make sure linting also done before requesting for review.
- Creating component?! Make sure to create simple tests, you can check other components for examples.
- Always make sure component and pages stay fast without unnecessary re-renders because those will slow down app/performance.
-

***
## Issues

To report a non-critical issue, please file an issue on this GitHub project.

If you find a security issue please report details to: security@ecency.com

We will evaluate the risk and make a patch available before filing the issue.

[//]: # "LINKS"
[ecency_vision]: https://ecency.com
[ecency_alpha]: https://alpha.ecency.com
[ecency_release]: https://github.com/ecency/ecency-vision/releases
