/**
 * Rage Button
 * https://github.com/jfietkau/RageButton/
 *
 * Copyright (c) 2018 Julian Fietkau
 *
 *************************************************************************
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *************************************************************************
 */

/* content script */

function rageifyText(text) {
  text = text.replace(/[A-Z0-9\u00C0-\u00DE]/g , "A");
  text = text.replace(/[a-z\u00DF-\u00FF]/g , "a");
  // TODO maybe at some point: more character sets? cyrillic, greek, japanese, chinese?
  return text;
}

function rageify(elem) {
  // thanks to https://stackoverflow.com/a/10730777
  // find all text elements
  var n, textElems=[], walk=document.createTreeWalker(elem, NodeFilter.SHOW_TEXT, null, false);
  while(n = walk.nextNode()) {
    textElems.push(n);
  }

  for(var i = 0; i < textElems.length; i++) {
    var textElem = textElems[i];
    // used to do this as a CSS class, but it kept being overridden by higher-priority font
    // declarations. best as I can tell, this is the most apropos way to apply the style to
    // every element under all circumstances.
    textElem.parentElement.style.fontVariant = "small-caps";
    textElem.textContent = rageifyText(textElem.textContent);
  }

  // next, find all text fields (input/textarea), this includes form buttons spawned by input tags
  var n, inputElems=[], walk=document.createTreeWalker(
    elem,
    NodeFilter.SHOW_ALL,
    { acceptNode: function(node) {
      if(node.tagName === "INPUT" || node.tagName === "TEXTAREA") {
        return NodeFilter.FILTER_ACCEPT;
      } else {
        return NodeFilter.FILTER_SKIP;
      }
    }},
    false
  );
  while(n = walk.nextNode()) {
    inputElems.push(n);
  }

  for(var i = 0; i < inputElems.length; i++) {
    var inputElem = inputElems[i];
    inputElem.style.fontVariant = "small-caps";
    if(inputElem.value && inputElem.value.length > 0) {
      inputElem.value = rageifyText(inputElem.value);
    }
    if(inputElem.placeholder && inputElem.placeholder.length > 0) {
      inputElem.placeholder = rageifyText(inputElem.placeholder);
    }
  }
}

(function() {
  // simple attempt to not run our code twice for the same page
  if (window.alreadyInserted) {
    return;
  }
  window.alreadyInserted = true;

  rageify(document.body);

  // this is so we also catch stuff that gets dynamically added to the page
  var observer = new MutationObserver(function(mutations) {
    for(var i = 0; i < mutations.length; i++) {
      var mutation = mutations[i];
      rageify(mutation.target);
    }
  });
  var config = { attributes: true, childList: true, characterData: true, subtree: true, attributeFilter: ["placeholder", "value"] };
  observer.observe(document.getElementsByTagName("body")[0], config);

})();
