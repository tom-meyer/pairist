# Pairist

A tool for developer pairing. Very alpha, currenly under development.

Example 'screen shot':

    mymac:pairist tom$ bin/pairist
    Current team (5 developers)
    	Tom, Phil, Todd, Chris, Peter
    There are 3 solutions. How's this?

    	Peter (soloing)
    	Tom & Phil
    	Chris & Todd on Login page

    r Suggest another pairing
    p Manually pair developers
    a Assign/unassign story
    s Toggle solo status
    e Edit developers
    q Quit
    > 

Running
-------
This is currently a command line tool. Just clone the repo and run
`bin/pairist`.  Node.js is the only prerequisite.

Capabilities
------------

* Generates random pairings
* Supports soloing, trio-ing, manual pair assignments
* Tab-completion for developer and story names

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
