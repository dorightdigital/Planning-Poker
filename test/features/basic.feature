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
	Scenario: Full example
		Given I create a room
		And Fred joins the room
		And George joins the room
		When I request a vote for task "My task"
		Then Fred should be requested to vote
		And George should be requested to vote
		When Fred votes 3
		And George votes 3
		Then I should see vote summary "Everyone voted 3"
		And Fred should see vote summary "Everyone voted 3"
		And George should see vote summary "Everyone voted 3"


	Scenario: Vote Requests
		Given I create a room
		And Fred joins the room
		When I request a vote for task "My task"
		Then Fred should be requested to vote

	Scenario: No consensus on results
		Given I create a room
		And Fred joins the room
		And George joins the room
		When I request a vote for task "My task"
		When Fred votes 5
		And George votes 3
		Then I should see vote summary "Vote was not unanimous"
		And Fred should see vote summary "Vote was not unanimous"
		And George should see vote summary "Vote was not unanimous"

	Scenario: Host is alerted about guest requests until user disconnects
		Given I create room "My room"
		When Fred visits room
		And Fred requests access
		Then I should see participation request for Fred
		When Fred disconnects
		Then I should see no participation requests

	@smoke
	Scenario: Vote Progress shown to users.
		Given I create a room with 3 users
		When I request a vote
		And 2 users vote 3
		Then all users should see vote progress as 66%

