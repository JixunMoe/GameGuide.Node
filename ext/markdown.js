function fixMarkdown(html) {
  let result = html;
  result = result.replace(/<table/g, '<table class="table table-hover table-inline table-bordered"');
  result = result.replace(/<a (href="(https?|\/\/))/g, '<a rel="external nofollow noreferrer" target="_blank" $1');
  result = result.replace(/>\s+</g, '><');
  return result.trim();
}

module.exports = fixMarkdown;