export const navBarOptions = {
  menuOptionsTop: [{
        action: 'router',
        path: 'snapshot',
        title: 'MS Care',
        icon: 'fa icon-graph'
    },
    {
      action: "router",
      path: 'notes',
      title: "Progress Notes",
      icon: "fa icon-notesneuroshare",
    },
    {
      action: 'router',
      path: 'summary',
      title: 'After Visit Summary',
      icon: 'fa icon-avsneuroshare'
  }],
  menuOptionsBottom: [{
      action: "modal",
      title: 'Send Feedback',
      icon: 'fa icon-bugreport'
    },
    {
      action: "link",
      url: 'https://www.google.com/',
      title: 'Users Guide',
      icon: 'fa icon-openneuroshare'
  }]
};