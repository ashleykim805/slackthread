document.getElementById('apply-format').addEventListener('click', function() {
    let editorContent = document.getElementById('editor').innerHTML;
    let viewOption = document.querySelector('input[name="view"]:checked');
    let showReactions = document.getElementById('show-reactions').checked;

    if (viewOption) {
        if (viewOption.value === 'bullet') {
            editorContent = convertToBulletView(editorContent);
        } else if (viewOption.value === 'table') {
            editorContent = convertToTableView(editorContent);
        }
    }

    if (showReactions) {
        editorContent = addReactions(editorContent);
    }

    document.getElementById('editor').innerHTML = editorContent;
});

function convertToBulletView(content) {
    return content.replace(/<div class="c-message_kit__blocks c-message_kit__blocks--rich_text.*?>(.*?)<\/div>/g, '<ul><li>$1</li></ul>');
}

function convertToTableView(content) {
    return content.replace(/<div class="c-message_kit__blocks c-message_kit__blocks--rich_text.*?>(.*?)<\/div>/g, '<table><tr><td>$1</td></tr></table>');
}

function addReactions(content) {
    const reactions = ['+1', 'ty', 'pin']; // You can expand this based on your emoji options
    reactions.forEach(emoji => {
        const emojiImg = `<img src="https://a.slack-edge.com/production-standard-emoji-assets/14.0/apple-small/${emoji}@2x.png" alt="${emoji}" />`;
        content = content.replace(new RegExp(`<button.*?data-stringify-emoji="${emoji}".*?>.*?</button>`, 'g'), emojiImg);
    });
    return content;
}
