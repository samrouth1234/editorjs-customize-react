git add .
echo "========================================"
read -p "Please enter commit : " commit
echo "========================================"
git commit -m "$commit"
echo "========================================"
read -p "Please Enter your branch name: " branch
echo "========================================"
git push origin $branch

echo "==========😍😍😍😍😍😍😍============="
echo "Git push to $branch completed successfully!😒"