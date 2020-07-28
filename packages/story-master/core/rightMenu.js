module.exports = {
    createRightMenu(template) {
        const Remote = require('electron').remote;
        const Menu = Remote.Menu;
        const MenuItem = Remote.MenuItem;

        let menu = new Menu();
        for (let i = 0; i < template.length; i++) {
            menu.append(new MenuItem(template[i]));
        }
        let win = Remote.getCurrentWindow();
        menu.popup(win);
    },
};
