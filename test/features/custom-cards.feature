Feature: Custom Card Decks

  Background:
    Given I create a room with 2 users

  Scenario: Default
    When I request a vote
    Then All users should see cards 1,2,3,5,8,13,21

  Scenario: Custom example
    When I set the card deck to 1,3,5
    And I request a vote
    Then All users should see cards 1,3,5

  Scenario: Whole words & spaces
    When I set the card deck to Snail , Quail,Whale
    And I request a vote
    Then All users should see cards Snail,Quail,Whale
