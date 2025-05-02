const EDITOR = document.getElementById("editor");
const OUTPUT = document.getElementById('output');
const EMOJI_BOX = document.getElementById("include-reaction-emoji");
const TIMESTAMP_BOX = document.getElementById("include-timestamps");

/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*
    User Selections & Preferences  
*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*/

const OutputFormat = {
    BULLET: "bullet",
    TABLE: "table"
}

let USER_FORMAT_SELECTIONS = {
    outputFormat: OutputFormat.BULLET,
    showReactionEmojis: EMOJI_BOX.checked,
    includeTimestamps: document.getElementById("include-timestamps").checked,
    showTimestamp: false,
    showSenderName: false
}

/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*
    Formatting Functions
*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*/

EDITOR.addEventListener('click', (e) => {
    formatSlackInput();
});

EDITOR.addEventListener('paste', (e) => {
    setTimeout(() => {
        formatSlackInput();
      }, 10);
});

OUTPUT.addEventListener('click', (e) => {
    copyToClipboard();
});

TIMESTAMP_BOX.addEventListener('click', (e) => {
    USER_FORMAT_SELECTIONS.includeTimestamps = !USER_FORMAT_SELECTIONS.includeTimestamps;
    formatSlackInput();
});

EMOJI_BOX.addEventListener('click', (e) => {
    USER_FORMAT_SELECTIONS.showReactionEmojis = !USER_FORMAT_SELECTIONS.showReactionEmojis;
    formatSlackInput();
});

function formatSlackInput() {
    const formattedContent = format();
    display(formattedContent);
}

function display(formattedContent) {
    setDisplay(formattedContent);
    // copyToClipboard();
}

function setDisplay(formattedContent) {
    OUTPUT.append(formattedContent);
}

function copyToClipboard() {
        const div = document.getElementById('output');
    
        // Create a range and select the div contents
        const range = document.createRange();
        range.selectNodeContents(div);
    
        // Clear current selection and add the new range
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    
            // Execute the copy command
            const successful = document.execCommand('copy');
            if (successful) {
                showCopiedMessage();
            } else {
                alert('Copy command was unsuccessful');
            }
}

function showCopiedMessage() {
    const dialog = document.getElementById('alertDialog');
    dialog.show();
    setTimeout(() => dialog.close(), 600);
}

/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*
    Formatting Slack Input
*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*/

function clearOutput() {
    OUTPUT.innerHTML = null;
}

function format() {
    clearOutput();

    const input = EDITOR; 
    // Set up the temporary div to hold the output
    // 1. Create a temporary div to hold the output
    const outputContainer = document.createElement('div');
    // 2. We want to display the messages as ul
    // const messagesContainer = Object.assign(document.createElement('ul'), {
    //     className: 'messages-container',
    // });
    // messagesContainer.append(...processElement(input));
    // outputContainer.append(messagesContainer);

    outputContainer.append(...processElement(input));

    return outputContainer;
}

/**
     * Should be called for each child of an element
     * Returns a list of elements which should be appended to the element
     * @param element to process, convert & parse
     */
function processElement(element) {
    console.log("processing element: ", element);

    let transformedNode = Object.assign(document.createElement('div'), {
        innerText: element.classList.toString()
    });

    if (element.className == "c-message_kit__gutter__left"
        || element.className == "c-message_actions__container c-message__actions") {
        // We don't want to process anything in the left gutter 
        return [];
    }
    // if (element.className == "p-rich_text_section") {
    //     // Rich text sections are differently 
    //     return processMessageContentElement(element);
    // }
    transformedNode = convertElementToHTML(element);
    
    // PROCESS ELEMENT CHILDREN 
    const processedChildren = Array.from(element.children)
        .map(child => processElement(child))
        .flat();

    if (transformedNode == null) {
        // If this element was not meant to be transformed into an actual element to add,
        // it's still possible its children should be appended to the parent
        return processedChildren;
    } else {
        // If this element was transformed into something useful, append the processed children to the transformed node
        // return the transformed node as the only output of the processing
        transformedNode.append(...processedChildren);
        return [ transformedNode ];
    }
}

function convertElementToHTML(element) {
    if (element.className == "c-message_kit__gutter__left") {
        return null;
    }
    if (element.className == "c-virtual_list__item") {
        return processMessageContainer(element);
    }
    if (element.className == "c-link--button c-message__sender_button") {
        return processNameLabel(element);
    }   
    if (element.className == "c-timestamp__label") {
        return processTimestamp(element);
    }
    if (element.className == "p-rich_text_section") {
        return processRichTextSection(element);
    }

    if (USER_FORMAT_SELECTIONS.showReactionEmojis) {
        if (element.className == "c-button-unstyled c-reaction c-reaction--light") {
            return Object.assign(document.createElement('p'), {
            }); 
        }
        if (element.className == "c-reaction__count") {
            return processReactionEmojiCount(element);
        }
        if (element.className == "c-emoji c-emoji__small") {
            return processReactionEmojiImg(element);
        }
    }

    return null;
    // stuff to show class name, delete later
    // return Object.assign(document.createElement('div'), {
    //     innerText: element.classList.toString()
    // });
}

function processMessageContainer(element) {
    return Object.assign(document.createElement('p'), {
    });
}

function processNameLabel(element) {
    let name = element.innerText;
    if (!USER_FORMAT_SELECTIONS.includeTimestamps) {
        name += ": ";
    }
    return Object.assign(document.createElement('b'), {
        innerText: name
    });
}

function processTimestamp(element) {
    if (!USER_FORMAT_SELECTIONS.includeTimestamps) {
        return null;
    }
    return Object.assign(document.createElement('span'), {
        innerText: " [" + element.innerText + "]: "
    });
}

function processRichTextSection(element) {
    return Object.assign(document.createElement('p'), {
        innerHTML: element.innerHTML
    });
}

const NodeType = {
    ELEMENT_NODE: 1,
    TEXT_NODE: 3
}
function recurseRichTextSection(element) {
    let transformedNode = null;
    switch (element.nodeType) {
        case NodeType.ELEMENT_NODE:
            transformedNode = processElementNode(element);
            break;
        case NodeType.TEXT_NODE:
            transformedNode = document.createTextNode(element.textContent);
            break;
    }

    const processedChildren = Array.from(element.childNodes)
        .map(child => recurseRichTextSection(child))
        .flat();

    if (transformedNode == null) {
        return processedChildren;
    } else {
        transformedNode.append(...processedChildren);
        return [transformedNode];
    }
}


function processElementNode(element) {
    if (element.classList.contains("p-rich_text_block")) {
        transformedNode = document.createElement("span")
    }
    if (element.classList.contains("p-rich_text_list__ordered")) {
        transformedNode = document.createElement('ol');
    }
    if (element.classList.contains("p-rich_text_list__bullet")) {
        transformedNode = document.createElement('ul');
    }
    if (element.tagName == "LI") {
        transformedNode = document.createElement('li');
    }
    if (element.classList.contains("p-rich_text_section")) {
        transformedNode = document.createElement('p');
    }
    // text sections
    switch (element.tagName) {
        case "B":
            return document.createElement('b');
        case "I":
            return document.createElement('i');
        case "S":
            return document.createElement('s');
        case "A":
            return document.createElement('a');
        case "BR":
            return document.createElement('br');
        default:
            // return Object.assign(document.createElement('div'), {
            //     innerHTML: element.innerHTML
            // });
    }
    return null;
}

function processReactionEmojiImg(element) {
    return Object.assign(document.createElement('img'), {
        style: {
            width: "16px",
            height: "16px",
            margin: 0
        },
        src: element.src
    });
}

function processReactionEmojiCount(element) {
    return Object.assign(document.createElement('span'), {
        innerHTML:  "&nbsp;" + element.innerText + "&nbsp;"
    });
}
