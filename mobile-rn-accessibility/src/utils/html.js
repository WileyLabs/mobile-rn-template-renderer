/**
 * Miscelleneous html ARIA helper functions
 * 
 * Version: 0.0.2, 2018.08.10
 * Created: 2018.07.01 by mmalykh@wiley.com
 */
import helpers from './helpers';

const log = console.log.bind('[helpers]');

 // Wraps 'what' with 'wrapper.begin' and 'wrapper.end' and returns updated html
export function htmlWrapper(html, what, wrapper, flags  = 'g') {
  try {
    return html.replace(new RegExp(what, flags), (wrapper.before || '') + what + (wrapper.after || ''));
  }
  catch (err) {
    log(err.message);
  }
  return html;
}

// Sets aria label ('how') for html fragment ('how:what') or array of tags
export function addLabel(html, how = { what: '', label: '', role: '', flags: '', specificAttrs: [] }) {
  try {
    const labels = Array.isArray(how) ? how.slice() : [how];
    let updatedHtml = html;
    labels.forEach(elem => {
      const role = elem.role || 'document';
      const label = elem.label || '';
      const before = `<span role="${role}" aria-label="${label}"` + (elem.specificAttrs ? ' ' + elem.specificAttrs.join(' ') : '') + '>';
      const wrapper = { before, after: '</span>' };
      helpers.isDefined(elem.what) && (updatedHtml = htmlWrapper(updatedHtml, elem.what, wrapper, elem.flags));
    });
    return updatedHtml;
  }
  catch (err) {
    log(err.message);
  }
  return html;
}

// Adds aria attribute for class(es)
export function addClassAttribute(html, how = { class: '', attr: '', value: '', flags: '' }) {
  try {
    const classes = Array.isArray(how) ? how.slice() : [how];
    let updatedHtml = html;
    classes.forEach(elem => {
      const wrapper = { before: '', after: ` ${elem.attr}="${elem.value}" `};
      updatedHtml = htmlWrapper(updatedHtml, `class="${elem.class}"`, wrapper, elem.flags || 'g');
    });
    return updatedHtml;
  }
  catch (err) {
    log(err.message);
  }
  return html;
}

/**
 * Adds ARIA's attribute 'attrText' for class 'className' or array of classes
 * @param html source html
 * @param className single class name or array of class names as strings
 * @param attrText html attribute as string
 * @return updated html or source html in case of error
 */
export function addClassAttributeAsText(html, className, attrText) {
  try {
    const classes = Array.isArray(className) ? className.slice() : [className];
    let updatedHtml = html;
    classes.forEach(elem => {
      const wrapper = { before: '', after: ' ' + attrText };
      updatedHtml = htmlWrapper(updatedHtml, `class="${elem}"`, wrapper);
    });
    return updatedHtml;
  }
  catch (err) {
    log(err.message);
  }
  return html;
}

// functions
export const publicUtils = {
  htmlWrapper, addLabel, addClassAttribute, addClassAttributeAsText
};

export default publicUtils;
