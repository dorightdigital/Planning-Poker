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
		When guest visits room
		And guest enters name "Fred"
		Then guest should see title "Waiting to see if you are allowed into My room"
		And I should see title "Hosting room My room"

	Scenario: Host is alerted about guest requests until user disconnects
		Given I create room "My room"
		When guest visits room
		And guest enters name "Fred"
		Then host should see participation request for Fred
		When guest disconnects
		Then host should see no participation requests

