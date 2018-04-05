assert_identical() {
	actual=${1:?}; shift
	expected=${1:?}; shift
	diff -u "$expected" "$actual" || diff -q "$expected" "$actual"
}
