//
//  WelcomeOnboardingViewController.swift
//  Mindrop
//
//  Created by Mark Miller on 6/4/17.
//  Copyright © 2017 mdesigns. All rights reserved.
//

import UIKit

class WelcomeOnboardingViewController: UIViewController, UICollectionViewDataSource,
    UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
    
    // Set welcome layout and properties
    lazy var welcomeLayout: UICollectionView = {
        let layout = UICollectionViewFlowLayout()
        layout.scrollDirection = .horizontal
        layout.minimumLineSpacing = 0
        let cv = UICollectionView(frame: .zero, collectionViewLayout: layout)
        cv.backgroundColor = UIColor(red: 99/255, green: 86/255, blue: 164/255, alpha: 1)
        cv.dataSource = self
        cv.delegate = self
        cv.showsHorizontalScrollIndicator = false
        cv.isPagingEnabled = true
        return cv
    }()
    
    // Initialize default cell id
    let cellId = "cellId"
    
    let loginCellId = "loginCellId"
    
    let pages: [Page] = {
        let firstPage = Page(title: "Join us on slack", message: "Where you can communicate with other developers, discuss issues or bugs, or request new content for the future.", imageName: "ob1")
        let secondPage = Page(title: "Fun interactive Learning", message: "Learn by watching full HD interactive video tutorials that will prepare you for developer success", imageName: "ob2")
        let thirdPage = Page(title: "Become a premium member", message: "Enjoy hours of content at your finger tips, full support, and totally cool projects to add to your portfolio", imageName: "ob3")
        let fourthPage = Page(title: "Welcome to Mindrop", message: "Click the start learning button to continue", imageName: "ob4")
        return [firstPage, secondPage, thirdPage, fourthPage]
    }()
    
    lazy var pageControl: UIPageControl = {
        let pc = UIPageControl()
        pc.pageIndicatorTintColor = .white
        pc.currentPageIndicatorTintColor = UIColor(red: 15/255, green: 175/255, blue: 194/255, alpha: 1)
        pc.numberOfPages = self.pages.count
        return pc
    }()
    
    lazy var skipButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("Skip", for: .normal)
        button.setTitleColor(UIColor(red: 99/255, green: 86/255, blue: 164/255, alpha: 1), for: .normal)
        button.addTarget(self, action: #selector(finishOnBoarding), for: .touchUpInside)
        return button
    }()
    
    lazy var nextButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("Next", for: .normal)
        button.setTitleColor(UIColor(red: 99/255, green: 86/255, blue: 164/255, alpha: 1), for: .normal)
        button.addTarget(self, action: #selector(nextPage), for: .touchUpInside)
        return button
    }()
    
    lazy var completedButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("Start Learning", for: .normal)
        button.setTitleColor(UIColor.white, for: .normal)
        button.backgroundColor = UIColor(red: 15/255, green: 175/255, blue: 194/255, alpha: 1)
        button.addTarget(self, action: #selector(finishOnBoarding), for: .touchUpInside)
        return button
    }()
    
    func finishOnBoarding() {
        let userDefaults = UserDefaults.standard
        
        userDefaults.set(true, forKey: "OnboardingComplete")
        
        userDefaults.synchronize()
        
        performSegue(withIdentifier: "loginFromOnBoading", sender: nil)
    }
    
    func nextPage() {
        // We are on the last page
        if pageControl.currentPage == pages.count - 1 {
            return
        }
        
        if pageControl.currentPage == pages.count - 2 {
            moveControlContraintsOffScreen()
            UIView.animate(withDuration: 0.5, delay: 0, options: .curveEaseOut, animations: {
                self.view.layoutIfNeeded()
            }, completion: nil)
        }
        
        let indexPath = IndexPath(item: pageControl.currentPage + 1, section: 0)
        welcomeLayout.scrollToItem(at: indexPath, at: .centeredHorizontally, animated: true)
        pageControl.currentPage += 1
    }
    
    var pageControlBottomAnchor: NSLayoutConstraint?
    var skipButtonAnchor: NSLayoutConstraint?
    var nextButtonAnchor: NSLayoutConstraint?
    var finishButton: NSLayoutConstraint?
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Add welcome layout to sub view to be visible
        view.addSubview(welcomeLayout)
        view.addSubview(pageControl)
        view.addSubview(skipButton)
        view.addSubview(nextButton)
        view.addSubview(completedButton)
        
        finishButton = completedButton.anchor(nil, left: view.leftAnchor, bottom: view.bottomAnchor, right: view.rightAnchor, topConstant: 0, leftConstant: 0, bottomConstant: -50, rightConstant: 0, widthConstant: 0, heightConstant: 50)[1]
        
        pageControlBottomAnchor = pageControl.anchor(nil, left: view.leftAnchor, bottom: view.bottomAnchor, right: view.rightAnchor, topConstant: 0, leftConstant: 0, bottomConstant: 0, rightConstant: 0, widthConstant: 0, heightConstant: 40)[1]
        
        skipButtonAnchor = skipButton.anchor(view.topAnchor, left: view.leftAnchor, bottom: nil, right: nil, topConstant: 16, leftConstant: 0, bottomConstant: 0, rightConstant: 0, widthConstant: 60, heightConstant: 50).first
        
        nextButtonAnchor = nextButton.anchor(view.topAnchor, left: nil, bottom: nil, right: view.rightAnchor, topConstant: 16, leftConstant: 0, bottomConstant: 0, rightConstant: 0, widthConstant: 60, heightConstant: 50).first
        
        // Set welcome layout contraints
        welcomeLayout.anchorToTop(view.topAnchor, left: view.leftAnchor, bottom: view.bottomAnchor, right: view.rightAnchor)
        
        // Register ui collection view cell with welcome layout
        registerCells()
    }
    
    func scrollViewWillEndDragging(_ scrollView: UIScrollView, withVelocity velocity: CGPoint, targetContentOffset: UnsafeMutablePointer<CGPoint>) {
        
        let pageNumber = Int(targetContentOffset.pointee.x / view.frame.width)
        
        pageControl.currentPage = pageNumber
        
        // On last page
        if pageNumber + 1 == pages.count {
            moveControlContraintsOffScreen()
        } else {
            moveControlContraintsOnScreen()
        }
        UIView.animate(withDuration: 0.5, delay: 0, options: .curveEaseOut, animations: {
            self.view.layoutIfNeeded()
        }, completion: nil)
    }
    
    fileprivate func moveControlContraintsOffScreen() {
        pageControlBottomAnchor?.constant = 40
        skipButtonAnchor?.constant = -40
        nextButtonAnchor?.constant = -40
        finishButton?.constant = 0
    }
    
    fileprivate func moveControlContraintsOnScreen() {
        pageControlBottomAnchor?.constant = 0
        skipButtonAnchor?.constant = 16
        nextButtonAnchor?.constant = 16
        finishButton?.constant = 50
    }
    
    fileprivate func registerCells() {
        welcomeLayout.register(PageCell.self, forCellWithReuseIdentifier: cellId)
    }
    
    // Number of scroll views needed
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return pages.count
    }
    
    // Set properties for each individual cell
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: cellId, for: indexPath) as! PageCell
        
        
        let page = pages[indexPath.item]
        cell.page = page
        return cell
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        return CGSize(width: view.frame.width, height: view.frame.height)
    }
    
    // Check device orientation
    override func willTransition(to newCollection: UITraitCollection, with coordinator: UIViewControllerTransitionCoordinator) {
        
        welcomeLayout.collectionViewLayout.invalidateLayout()
        
        let indexPath = IndexPath(item: pageControl.currentPage, section: 0)
        
        // Scroll to index path after the rotation is going
        DispatchQueue.main.async {
            self.welcomeLayout.scrollToItem(at: indexPath, at: .centeredHorizontally, animated: true)
            self.welcomeLayout.reloadData()
        }
    }
}
