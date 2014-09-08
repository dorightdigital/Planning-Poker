@wip
Feature: User Icons
	A chance for users to put a personal touch on their Planning Poker persona.

  Background:
    Given I create a room

  Scenario: Default Icon when Pending
	When Fred visits room
	And Fred requests access
	Then I should see icon "smiley-line" for pending user "Fred"

Scenario: Default Icon when Accepted
	When Fred joins the room
	Then I should see icon "smiley" for active user "Fred"
	And Fred should see icon "smiley" for active user "Fred"

Scenario: Choose an icon
	When Fred joins the room
	Then I should see icon "smiley" for active user "Fred"
	And Fred should see icon "smiley" for active user "Fred"
