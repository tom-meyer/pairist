# Pairist

A tool for developer pairing. Very alpha, currenly under development.

Running
-------
This is currently a command line tool. Just clone the repo and run
`bin/pairist`.  Node.js is the only prerequisite.

Capabilities
------------

* Generates random pairings
* Supports soloing, trio-ing, manual pair assignments

Upcoming
--------

* Location awareness for smart pairing of remote developers
* Pairing history
* git-base storage for easy collaboration
* HTML UI

Testing
-------

Only the core pairing code is tested. Need to
figure out a good way to test the cli parts.

Install npm package `jasmine-node`. (Look into switching to normal jasmine)

    jasmine-node src/*_spec.js
