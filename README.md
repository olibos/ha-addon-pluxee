# Home Assistant Add-on: Firefly iii Pluxee Belgium transactions importer

[![GitHub Release][releases-shield]][releases]
![Project Stage][project-stage-shield]
[![License][license-shield]](LICENSE.md)

[![Github Actions][github-actions-shield]][github-actions]
![Project Maintenance][maintenance-shield]
[![GitHub Activity][commits-shield]][commits]
[![Quality gate][quality_gate_shield]][quality_gate]

Import [Pluxee](https://www.sodexo.be/fr/) transactions effortlessly into Firefly III.

## About

Pluxee Belgium is widely recognized for its diverse range of services, notably its meal vouchers, which serve as a popular employee benefit. These meal vouchers, commonly included in employees' compensation packages, allow individuals to conveniently and tax-efficiently purchase meals at affiliated restaurants, cafes, and other food establishments. Pluxee Belgium's meal voucher program is designed to promote the well-being of employees by ensuring access to quality and affordable food options, thereby enhancing their overall satisfaction.

This add-on being is designed to seamlessly integrate meal voucher transactions into Firefly III, streamlining the process of managing financial data. By automating the import of meal voucher transactions, users can effortlessly track and categorize their expenses within the Firefly III platform. This application simplifies financial management, providing users with a more efficient and organized way to monitor their meal-related expenditures. Its integration capabilities ensure a smooth and user-friendly experience, enhancing the overall functionality of Firefly III for those who rely on meal vouchers as part of their financial transactions..

## Configuration
First create your Firefly [Personal Access Token](https://docs.firefly-iii.org/how-to/firefly-iii/features/api/#personal-access-tokens). Then create your Pluxee accounts manually in Firefly. Note the account's IDs : you can find them in the URL in an account's page. Finally, fill in the mandatory options in the configuration tab of the add-on.

- Addon options

```yaml
# Mandatory
"login": your Pluxee login
"password": your Pluxee password
"url": your Firefly instance URL
"token": your Firefly Personal Access Token
# Optional
"cron": the cron used to import data from Pluxee # More info, see https://crontab.guru/
"book": the Firefly account ID for the Pluxee Book account
"eco": the Firefly account ID for the Pluxee Cco account
"gift": the Firefly account ID for the Pluxee Gift account
"lunch": the Firefly account ID for the Pluxee Lunch account
"sportCulture": the Firefly account ID for the Pluxee Sport/Culture account
"transport": the Firefly account ID for the Pluxee Transport account
"conso": the Firefly account ID for the Pluxee Consumption account
"after": the first to import the transactions from
```

## Installation

The installation of this add-on is pretty straightforward and not different in comparison to installing any other add-on.

1. Add my add-ons repository to your home assistant instance (in supervisor addons store at top right, or click button below if you have configured my HA)
   [![Open your Home Assistant instance and show the add add-on repository dialog with a specific repository URL pre-filled.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https://github.com/olibos/ha-addon-pluxee)
1. Install this add-on.
1. Click the `Save` button to store your configuration.
1. Set the add-on options to your preferences
1. Start the add-on.
1. Check the logs of the add-on to see if everything went well.

## Contributing

I'm all about collaboration and would love for you to jump in and contribute to this project. Whether you're spotting bugs, suggesting cool new features, or just want to spruce up the docs, your input is gold. Feel free to fork the repo, make your magic in new branches, and hit me up with pull requests. Let's make this project rock together! Big thanks for your interest and all the cool stuff you bring to the table. Cheers! 🚀

## Authors & contributors

The original setup of this repository is by [Olivier Bossaer][olibos].

## License

MIT License

Copyright (c) 2024 Olivier Bossaer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[commits-shield]: https://img.shields.io/github/commit-activity/y/olibos/ha-addon-pluxee.svg
[commits]: https://github.com/olibos/ha-addon-pluxee/commits/main
[olibos]: https://github.com/olibos
[github-actions-shield]: https://github.com/olibos/ha-addon-pluxee/workflows/CI/badge.svg
[github-actions]: https://github.com/olibos/ha-addon-pluxee/actions
[issue]: https://github.com/olibos/ha-addon-pluxee/issues
[license-shield]: https://img.shields.io/github/license/olibos/ha-addon-pluxee.svg
[maintenance-shield]: https://img.shields.io/maintenance/yes/2024.svg
[project-stage-shield]: https://img.shields.io/badge/Project%20Stage-Experimental-yellow.svg
[releases-shield]: https://img.shields.io/github/release/olibos/ha-addon-pluxee.svg
[releases]: https://github.com/olibos/ha-addon-pluxee/releases
[repository]: https://github.com/olibos/ha-addon-pluxee
[quality_gate_shield]: https://sonarcloud.io/api/project_badges/measure?project=olibos_ha-addon-pluxee&metric=alert_status
[quality_gate]: https://sonarcloud.io/summary/new_code?id=olibos_ha-addon-pluxee