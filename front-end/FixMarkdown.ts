/**
 * Created by Jixun on 21/08/2016.
 */

import marked = require('marked');

function fixMarkdown(markdown: string): string {
  let result = marked(markdown);
  result = result.replace(/<table/g, '<table class="table table-hover table-striped table-inline table-bordered"');
  result = result.replace(/<a (href="(https?|\/\/))/g, '<a rel="external nofollow noreferrer" target="_blank" $1');
  return result;
}

export = fixMarkdown;