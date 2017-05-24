/*
 *  iOS Note Editor
 *  Copyright (c) 2015, Shubham Aggarwal
 */


var editor = new Quill('#editor-container', {
                       //modules: {
                       // 'link-tooltip': true,
                       // 'image-tooltip': true
                       // }
                       });

function getCaretClientPosition() {
    var x = 0, y = 0;
    var sel = window.getSelection();
    if (sel.rangeCount) {
        var range = sel.getRangeAt(0);
        if (range.getClientRects) {
            var rects = range.getClientRects();
            if (rects.length > 0) {
                x = rects[0].left;
                y = rects[0].top;
                
                if(y < 0) y = rects[0].bottom;
//                console.log('left: '+rects[0].left+' top: '+rects[0].top + ' right: '+rects[0].right+' bottom: '+rects[0].bottom);
            }else{
                return null;
            }
        }
    }
    return y;
}

function printClientRects(){
    var sel = window.getSelection();
    if (sel.rangeCount) {
        var range = sel.getRangeAt(0);
        if (range.getClientRects) {
            var rects = range.getClientRects();
            if (rects.length > 0) {
//                console.log('left: '+rects[0].left+' top: '+rects[0].top + ' right: '+rects[0].right+' bottom: '+rects[0].bottom);
            }
        }
    }
}

function printClientBoundingRects(){
    var sel = window.getSelection();
    if (sel.rangeCount) {
        var range = sel.getRangeAt(0);
        var rect = range.getBoundingClientRect();
//        console.log('left: '+rect.left+' top: '+rect.top+' right: '+rect.right+' bottom: '+rect.bottom);
    }
}


function getCaretYPosition(){
    var sel = window.getSelection();
    if(sel.rangeCount == 0) return;
    var range = sel.getRangeAt(0);
    var span = document.createElement('br');
    range.collapse(false);
    range.insertNode(span);
    var topPosition = span.offsetTop;
    span.parentNode.removeChild(span);
    return topPosition;
}

function setTextAlignment(alignment){
    range = editor.getSelection()
    if(range){
        if(range.start == range.end){
            editor.prepareFormat('align',alignment);
        }else{
            editor.formatText(range.start,range.end,'align',alignment);
        }
    }else{
//        console.log('cursor is not in editor');
    }
}

function setLineFormat(format,value){
    range = editor.getSelection();
    if(range){
        editor.formatLine(range.start,range.end,format,value);
    }else{
//        console.log('cursor is not in editor')
    }
}

function setTextFormat(format,value){
    range = editor.getSelection();
    if(range){
        if(range.start == range.end){
            editor.prepareFormat(format,value);
        }else{
            editor.formatText(range.start ,range.end ,format ,value);
        }
    }else{
//        console.log('cursor is not in editor');
    }
}

function setEditorHTML(strHTML) {
    editor.setHTML(strHTML);
};

function updateWebViewContents(contents) {
    //Placeholder, uncomment and set contents
    //to contentsToUpdate in editor.set... to see placeholder
//    var contentsToUpdate = {
//        "ops": [
//            {
//                "insert": "Gandalf the Grey\n"
//            }
//        ]
//    }
    editor.setContents(contents);
}


function onTextSelectedInRange(range,attributes){
//    console.log('common attributes: ',attributes);
    if(attributes){
        callback = "edit://selection/"+range.start+"/"+range.end+"/"+attributes.join(',');
        //console.log('callback',callback);
        window.location = callback;
    }else{
        callback = "edit://selection/"+range.start+"/"+range.end+"/";
        //console.log('callback',callback);
        window.location = callback;
    }
}

/*Event Listener*/
editor.on('selection-change', function(range) {
//         console.log('selection-change', range);
          if(range){
                contents = editor.getContents(range.start,range.end);
                ops = contents.ops;
          
                attributesMap = {}
                attributesSet = new Set();
          
                for(op of ops){
                    attrs = op.attributes;
                    if(attrs){
                        keys = Object.keys(attrs);
                        for(attr of keys){
                            attributesSet.add(attr);
                            val = attrs[attr]
                            if(val){
                                if(attributesMap[attr]){
                                    attributesMap[attr] = attributesMap[attr] + 1;
                                }else{
                                    attributesMap[attr] = 1;
                                }
                            }
                        }
                    }else{
                        onTextSelectedInRange(range,null);
                        return;
                    }
                }
          
                op_count = ops.length;
                common_attributes = []
                for(attribute of attributesSet.keys()){
                    if(attributesMap[attribute] == op_count){
                        common_attributes.push(attribute);
                    }
                }
          
                if(common_attributes.length > 0){
                    onTextSelectedInRange(range,common_attributes);
                }else{
                    onTextSelectedInRange(range,null);
                }
          }
});


editor.on('text-change', function(delta, source) {
          var innerHeight = window.innerHeight;
          var scrollY = $(window).scrollTop();
          
          var clientY = getCaretClientPosition();
          var animationDuration = 100;  //0.1 ms
          
//          console.log("-------------------");
//          console.log("scrollY: "+scrollY);
//          console.log("innerHeight: "+innerHeight);
//          console.log("client rect: "+clientY);
//          console.log("limit: "+(scrollY + innerHeight - 40));
          
          if(clientY != null){
            if(clientY > innerHeight - 17){
                $('html,body').animate({'scrollTop':(scrollY + 17)},animationDuration/2); //50 ms
            }else if(clientY < 0){
                $('html,body').animate({'scrollTop':(scrollY + clientY - 4)},animationDuration);
            }
          }else{
            var cursorY = getCaretYPosition();
            if(cursorY > (scrollY + innerHeight - 20)){
                $('html,body').animate({'scrollTop':(cursorY - innerHeight + 20)},animationDuration/2); //50 ms
            }else if(scrollY > cursorY + 2){
                $('html,body').animate({'scrollTop':(cursorY + 2)},animationDuration);
            }
          }
          
          return;
          
});


function setHTML(html){
    editor.setHTML(html);
}

function getHTML(){
    return editor.getHTML();
}
