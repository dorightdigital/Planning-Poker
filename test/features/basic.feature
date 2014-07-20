Feature: Basic end-to-end integration tests

	Scenario: Hosting a room
		Given I create room "My room"
		Then I should see title "Hosting room My room"

	Scenario: Guests can view a room
		Given I create room "My room"
		When guest visits room
		Then guest should see title "Join room My room"

		@smoke
	Scenario: Request to join a room
		Given I create room "My room"
		When Fred visits room
		And Fred requests access
		Then Fred should see title "Waiting to see if you are allowed into My room"
		And I should see title "Hosting room My room"

		@smoke
	Scenario: Voting
		Given I create a room
		And Fred joins the room
		And George joins the room
		When I request a vote for task "My task"
		Then Fred should be requested to vote
		And George should be requested to vote

	Scenario: Host is alerted about guest requests until user disconnects
		Given I create room "My room"
		When Fred visits room
		And Fred requests access
		Then I should see participation request for Fred
		When Fred disconnects
		Then I should see no participation requests

