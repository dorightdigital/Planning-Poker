Contributing
===

Development
---

Prerequesites: You must have *git command line*, *npm*, *grunt* and *bower* installed

To run the server in dev mode which automatically runs tests and compilation on saves go
to the root of the project and run:

````sh
npm install && grunt dev
````

If you just want to make sure your version works you can run:

````sh
npm install && grunt test
````

New Features & Bugs
---

If you think something's broken or you have a great idea for a new feature
[raise an issue on GitHub](https://github.com/dorightdigital/Planning-Poker/issues)


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
