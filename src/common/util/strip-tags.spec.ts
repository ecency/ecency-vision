import stripTags from "./strip-tags";

it('MacOS', () => {
    expect(stripTags("<script>javascript</script> lorem ipsum dolor sit")).toBe('javascript lorem ipsum dolor sit');
});
