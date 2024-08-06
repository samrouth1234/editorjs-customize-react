git add .
echo "Please Enter your commit message: "
read commit
git commit -m "$commit"
echo "Please Enter your branch name: "
read branch
git push origin $branch