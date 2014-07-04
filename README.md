Contributing
===

Development
---

Prerequesites: You must have *git command line* & *npm* installed

To run the server in dev mode which automatically runs tests and compilation on saves go
to the root of the project and run:

````sh
npm install && npm start
````

If you just want to make sure your version works you can run:

````sh
npm install && npm test
````

New Features & Bugs
---

If you think something's broken or you have a great idea for a new feature
[raise an issue on GitHub](https://github.com/dorightdigital/Planning-Poker/issues)

What about Windows?
---

The main project works fine on Windows but we're not actively supporting Windows as a dev environment
becaues currently we have no Windows CI box to test that each new commit still works on Windows
and no developers eager to contribute from Windows.  If you think we'd benefit from supporting windows feel free to 
[raise an issue on GitHub](https://github.com/dorightdigital/Planning-Poker/issues).

Terms
---

**Room**
One team's space to play planning poker without interruption from other teams.

**User**
One user relates to one tab - if a person wants to join multiple rooms they can open multiple tabs
and the system will recognise them as multiple users.

**Participant**
A user in a room

**Pending Participant**
A user trying to join a room
