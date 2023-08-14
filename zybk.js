(function () {
	'use strict';
    
    $(document).ready(() => {
        $('head').append('<link rel="stylesheet" href="https://moonlightperson.github.io/fa-6-pro/css/all.css">');
        $('head').append('<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet');
        $('body').append('<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.js"></script>');
        $('.fr-toolbar.fr-ltr.fr-desktop.fr-top.fr-basic').prepend('<button id="xf-preview-shilkin" type="button" class="button rippleButton" data-xf-click="preview-click"><span class="button-text"></span></button>');
        $('.message-editorWrapper').append('<div id="select_prefix" class="xf-select-prefix"></div');
        
        addButton('Выбрать ответ', 'selectAnswer');
        MenuButtons.forEach((btn) => {
            addMenuButton(btn.title, btn.id);
            $('button#'+btn.id).click(() => editThreadData(btn.prefix_id, btn.openedThread ?? "1", btn.sticky ?? "0"));
        });
    
        const threadData = getThreadData();
        
        $(`button#selectAnswer`).click(() => {
            XF.alert(
                buttonsMarkup(buttons), 
                null, 
                `Мой господин, царь и бог <font color="${system.user.color}"><b>${system.user.name}</b></font>, выберите ответ:`
            );
            buttons.forEach((btn, id) => {
                $(`button#answers-${id}`).click(() => pasteContent(id, threadData));
            });
        });
    });
  
    function addButton(name, id) {
        $('.button--icon--reply').after(
            `<button type="button" class="button rippleButton" id="${id}" style="margin: 3px;">${name}</button>`,
        );
    }
    
    function addMenuButton(name, id) {
        $('#select_prefix').append(
            `<button type="button" class="button--link js-attachmentUpload button button--icon button--icon--attach menuButton" id="${id}" style="margin: 3px;">${name}</button>`,
        );
    }
  
    function buttonsMarkup(buttons) {
        return `<div class="select_answer">${buttons
        .map(
            (btn, i) =>
                `<button type="button" id="answers-${i}" class="button--primary button ` +
                `rippleButton ${btn.separator || 'panelButton'}" style="border-color:${btn.color}"><span class="button-text">${btn.title}</span></button>`,
        )
        .join('')}</div>`;
    }
    
    function pasteContent(id, data = {}) {
        const template = Handlebars.compile(buttons[id].content);
        if ($('.fr-element.fr-view p').text() === '') $('.fr-element.fr-view p').empty();

        $('span.fr-placeholder').empty();
        $('div.fr-element.fr-view p').append(template(data));
        $('a.overlay-titleCloser').trigger('click');
    }
  
    function getThreadData() {
        const authorID = $('a.username')[0].attributes['data-user-id'].nodeValue;
        const authorName = $('.message-threadStarterPost')[0].attributes['data-author'].nodeValue;
        const date = new Date();
        const hours = date.getHours();
	    
        return {
            user: {
                id: authorID,
                name: authorName,
                mention: `[USER=${authorID}]${authorName}[/USER]`,
            },
            time: {
                utc: `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`,
                local: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
            },
            date: {
                utc: `${date.getUTCDate()}.${date.getUTCMonth()}.${date.getUTCFullYear()}`,
                local: `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`
            },
            greeting: () =>
            4 < hours && hours <= 11
                ? 'Доброе утро'
                : 11 < hours && hours <= 15
                ? 'Добрый день'
                : 15 < hours && hours <= 21
                ? 'Добрый вечер'
                : 'Доброй ночи',
        };
    }

    function editThreadData(prefix, opened = "1", pinned = "0") {
        // Получаем заголовок темы, так как он необходим при запросе
        const threadTitle = $('.p-title-value')[0].lastChild.textContent;
    
        fetch(`${document.URL}edit`, {
            method: 'POST',
            body: getFormData({
                prefix_id: prefix,
                title: threadTitle,
                discussion_open: opened,
                sticky: pinned,
                _xfToken: XF.config.csrf,
                _xfRequestUri: document.URL.split(XF.config.url.fullBase)[1],
                _xfWithData: 1,
                _xfResponseType: 'json',
            }),
        }).then(() => location.reload());
    }
  
    function getFormData(data) {
        const formData = new FormData();
        Object.entries(data).forEach(i => formData.append(i[0], i[1]));
        return formData;
    }
})();