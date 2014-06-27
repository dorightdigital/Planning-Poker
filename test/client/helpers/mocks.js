var help = help || {};

var io = {
  connect: function () {
    return {
      on: function () {
      },
      emit: function () {
      }
    };
  }
};

help.createMockApi = function () {
  var spyApi = jasmine.createSpyObj('api', [
    'onFullVotingStatus',
    'requestRoomDetails',
    'onVotingRequest',
    'onRoomClose',
    'onUnanimousResult',
    'onMixedResult',
    'mockApi',
    'requestVotes',
    'onError',
    'onJoinRequest',
    'rejectParticipant',
    'acceptParticipant',
    'joinRoom',
    'vote',
    'onConnect',
    'openRoom'
  ]);
  spyApi.callbacks = {};
  spyApi.onConnect.and.callFake(function (fn) {
    spyApi.callbacks.connect = fn;
  });
  var approveOrReject = {
    onApprove: function () {
      return approveOrReject;
    },
    onReject: function () {
      return approveOrReject;
    }
  };
  spyApi.joinRoom.and.returnValue(approveOrReject);
  return  spyApi;
};

help.createMockGa = function () {
  return jasmine.createSpyObj('ga', ['trackEvent']);
};

help.setupDefaultParams = function () {
  return {
    tracker: help.createMockGa(),
    api: help.createMockApi()
  };
};
