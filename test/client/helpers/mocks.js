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
  return jasmine.createSpyObj('api', [
    'onConnect',
    'requestRoomDetails',
    'onVotingRequest',
    'onRoomClose',
    'onUnanimousResult',
    'onMixedResult',
    'mockApi',
    'openRoom'
  ]);
};

help.createMockGa = function () {
  return jasmine.createSpyObj('ga', ['trackEvent']);
};

help.setupDefaultParams = function () {
  return {
    tracker: help.createMockGa()
  };
};
