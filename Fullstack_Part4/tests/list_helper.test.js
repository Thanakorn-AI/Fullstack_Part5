// tests/list_helper.test.js
const listHelper = require('../utils/list_helper');

describe('Blog list tests', () => {
  describe('dummy', () => {
    it('returns one', () => {
      const blogs = [];
      const result = listHelper.dummy(blogs);
      expect(result).toBe(1);
    });
  });

  describe('total likes', () => {
    const listWithOneBlog = [
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
        __v: 0
      }
    ];

    const blogs = [
      { _id: "5a422a851b54a676234d17f7", title: "React patterns", author: "Michael Chan", url: "https://reactpatterns.com/", likes: 7, __v: 0 },
      { _id: "5a422aa71b54a676234d17f8", title: "Go To Statement Considered Harmful", author: "Edsger W. Dijkstra", url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html", likes: 5, __v: 0 },
      { _id: "5a422b3a1b54a676234d17f9", title: "Canonical string reduction", author: "Edsger W. Dijkstra", url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html", likes: 12, __v: 0 },
      { _id: "5a422b891b54a676234d17fa", title: "First class tests", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll", likes: 10, __v: 0 },
      { _id: "5a422ba71b54a676234d17fb", title: "TDD harms architecture", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html", likes: 0, __v: 0 },
      { _id: "5a422bc61b54a676234d17fc", title: "Type wars", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html", likes: 2, __v: 0 }
    ];
  

    it('of empty list is zero', () => {
      const result = listHelper.totalLikes([]);
      expect(result).toBe(0);
    });

    it('when list has only one blog, equals the likes of that', () => {
      const result = listHelper.totalLikes(listWithOneBlog);
      expect(result).toBe(5);
    });

    it('of a bigger list is calculated right', () => {
      const result = listHelper.totalLikes(blogs);
      expect(result).toBe(36);
    });
  });

  describe('favorite blog', () => {
    const blogs = [
      { _id: "5a422a851b54a676234d17f7", title: "React patterns", author: "Michael Chan", url: "https://reactpatterns.com/", likes: 7, __v: 0 },
      { _id: "5a422aa71b54a676234d17f8", title: "Go To Statement Considered Harmful", author: "Edsger W. Dijkstra", url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html", likes: 5, __v: 0 },
      { _id: "5a422b3a1b54a676234d17f9", title: "Canonical string reduction", author: "Edsger W. Dijkstra", url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html", likes: 12, __v: 0 }
    ];

    it('returns the blog with the highest likes', () => {
      const result = listHelper.favoriteBlog(blogs);
      const expected = {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        likes: 12
      };
      expect(result).toStrictEqual(expected);
    });

    it('returns an empty object for an empty array', () => {
      const result = listHelper.favoriteBlog([]);
      expect(result).toStrictEqual({});
    });
  });

  describe('most blogs', () => {
    const blogs = [
      { author: "Michael Chan", likes: 7 },
      { author: "Edsger W. Dijkstra", likes: 5 },
      { author: "Robert C. Martin", likes: 10 },
      { author: "Robert C. Martin", likes: 8 },
      { author: "Robert C. Martin", likes: 12 }
    ];

    it('returns the author with the most blogs', () => {
      const result = listHelper.mostBlogs(blogs);
      const expected = { author: "Robert C. Martin", blogs: 3 };
      expect(result).toStrictEqual(expected);
    });
  });

  describe('most likes', () => {
    const blogs = [
      { author: "Michael Chan", likes: 7 },
      { author: "Edsger W. Dijkstra", likes: 17 },
      { author: "Robert C. Martin", likes: 5 }
    ];

    it('returns the author with the most likes', () => {
      const result = listHelper.mostLikes(blogs);
      const expected = { author: "Edsger W. Dijkstra", likes: 17 };
      expect(result).toStrictEqual(expected);
    });

    it('returns correct data with multiple entries for the same author', () => {
      const extendedBlogs = [
        ...blogs,
        { author: "Robert C. Martin", likes: 10 },
        { author: "Robert C. Martin", likes: 3 }
      ];
      const result = listHelper.mostLikes(extendedBlogs);
      const expected = { author: "Robert C. Martin", likes: 18 };
      expect(result).toStrictEqual(expected);
    });

    it('returns an empty object for an empty array', () => {
      const result = listHelper.mostLikes([]);
      expect(result).toStrictEqual({});
    });
  });
});