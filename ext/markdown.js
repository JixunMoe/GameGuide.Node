function fixMarkdown(html) {
  let result = html;
  result = result.replace(/<table/g, '<table class="table table-hover table-striped table-inline table-bordered"');
  result = result.replace(/<a (href="(https?|\/\/))/g, '<a rel="external nofollow noreferrer" target="_blank" $1');
  return result;
}

module.exports = fixMarkdown;